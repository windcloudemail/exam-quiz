import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import * as mammoth from 'mammoth';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function parseDocument(file) {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return await parsePDF(file);
    } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
    ) {
        return await parseDOCX(file);
    } else {
        throw new Error('不支援的檔案格式，請上傳 PDF 或 DOCX 檔');
    }
}

async function parsePDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }

    return extractQuestions(fullText);
}

async function parseDOCX(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return extractQuestions(result.value);
}

function extractQuestions(text) {
    // 嘗試找出選擇題的題幹與選項
    // 由於規格書裡的題目格式可能不一，這裡實作一個簡單的 Regex 剖析器
    // 假設格式：
    // 1. 什麼是外幣保險？
    // (1)選項一 (2)選項二 (3)選項三 (4)選項四
    // 答案：1
    // 解說：這是解說

    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let currentObj = null;

    // Very basic heuristic parser based on common Taiwan exam formats
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 偵測題號 (例如 "1.", "01.", "1、")
        const questionMatch = line.match(/^(\d+)[\.、\s]+(.+)/);
        if (questionMatch) {
            if (currentObj && isQuestionValid(currentObj)) {
                questions.push(currentObj);
            }
            currentObj = {
                question: questionMatch[2].trim(),
                option_1: '', option_2: '', option_3: '', option_4: '',
                answer: 1,
                explanation: '',
                category: '未分類',
                difficulty: 'medium'
            };
            continue;
        }

        if (!currentObj) continue;

        // 偵測選項 (例如 "(1)xxx (2)yyy (3)zzz (4)www" 或 "A.xxx B.yyy C.zzz D.www")
        // 或者單行選項 "(1)xxx"
        let optionMatch = line.match(/(?:\(|（|)[1A](?:\)|）|\.|、)(.+?)(?:\(|（|)[2B](?:\)|）|\.|、)(.+?)(?:\(|（|)[3C](?:\)|）|\.|、)(.+?)(?:\(|（|)[4D](?:\)|）|\.|、)(.+)/);
        if (optionMatch) {
            currentObj.option_1 = optionMatch[1].trim();
            currentObj.option_2 = optionMatch[2].trim();
            currentObj.option_3 = optionMatch[3].trim();
            currentObj.option_4 = optionMatch[4].trim();
            continue;
        }

        // 多行選項
        const singleOptionMatch = line.match(/^(?:\(|（|)?([1-4A-D])(?:\)|）|\.|、)\s*(.+)/);
        if (singleOptionMatch) {
            const idx = parseOptionIndex(singleOptionMatch[1]);
            if (idx >= 1 && idx <= 4) {
                currentObj[`option_${idx}`] = singleOptionMatch[2].trim();
            }
            continue;
        }

        // 偵測答案 (例如 "答案: 1" 或 "解答：(A)")
        const answerMatch = line.match(/^(?:答案|解答|Ans)[:：\s]*(?:\(|（|)?([1-4A-D])(?:\)|）|)?/i);
        if (answerMatch) {
            currentObj.answer = parseOptionIndex(answerMatch[1]);
            continue;
        }

        // 偵測解說
        const expMatch = line.match(/^(?:解說|解析|說明)[:：\s]*(.+)/);
        if (expMatch) {
            currentObj.explanation = expMatch[1].trim();
            continue;
        }

        // 如果都沒有匹配，試圖附加到題幹或解說
        if (currentObj.explanation) {
            currentObj.explanation += '\n' + line;
        } else if (!currentObj.option_1) {
            currentObj.question += '\n' + line;
        }
    }

    if (currentObj && isQuestionValid(currentObj)) {
        questions.push(currentObj);
    }

    return questions;
}

function isQuestionValid(q) {
    return q.question && q.option_1 && q.option_2 && q.answer >= 1 && q.answer <= 4;
}

function parseOptionIndex(val) {
    if (['1', 'A', 'a'].includes(val)) return 1;
    if (['2', 'B', 'b'].includes(val)) return 2;
    if (['3', 'C', 'c'].includes(val)) return 3;
    if (['4', 'D', 'd'].includes(val)) return 4;
    return 1;
}
