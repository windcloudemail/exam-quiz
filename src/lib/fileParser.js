import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import * as mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

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
    } else if (fileType.startsWith('image/')) {
        return await parseImage(file);
    } else {
        throw new Error('不支援的檔案格式，請上傳 PDF、DOCX 或圖片檔');
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

async function parseImage(file) {
    const { data: { text } } = await Tesseract.recognize(file, 'chi_tra', {
        logger: m => console.log(m)
    });

    // Cleanup OCR noise spacing but PRESERVE newlines since the parser needs them
    let cleaned = text.replace(/[ \t\r]+/g, (match, offset, str) => {
        const prev = str[offset - 1];
        const next = str[offset + match.length];
        if (prev && next && /[a-zA-Z0-9]/.test(prev) && /[a-zA-Z0-9]/.test(next)) {
            return ' '; // preserve space between alphanumeric characters
        }
        return ''; // remove space between asian characters
    }).trim();

    return extractQuestions(cleaned);
}

function extractQuestions(text) {
    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let currentObj = null;

    const pushCurrentObj = () => {
        if (!currentObj || !currentObj._rawText) return;

        let fullText = currentObj._rawText.trim();

        // 1. 抽取解說
        const expMatch = fullText.match(/【?(?:解說|解析|說明)】?[:：\s]*(.*?)$/is);
        if (expMatch) {
            currentObj.explanation = expMatch[1].trim();
            fullText = fullText.substring(0, expMatch.index).trim();
        }

        // 2. 抽取答案 (如果原本沒抓到)
        if (!currentObj.answer) {
            const ansMatch = fullText.match(/【?(?:答案|解答|Ans)】?[:：\s]*(?:\(|（|)?([1-4A-D])(?:\)|）|)?/i);
            if (ansMatch) {
                const val = ansMatch[1];
                if (['1', 'A', 'a'].includes(val)) currentObj.answer = 1;
                else if (['2', 'B', 'b'].includes(val)) currentObj.answer = 2;
                else if (['3', 'C', 'c'].includes(val)) currentObj.answer = 3;
                else if (['4', 'D', 'd'].includes(val)) currentObj.answer = 4;
                fullText = fullText.substring(0, ansMatch.index).trim();
            }
        }

        // 3. 抽取選項
        const extractOptions = (t) => {
            const markersList = [
                ['(1)', '(2)', '(3)', '(4)'],
                ['（1）', '（2）', '（3）', '（4）'],
                ['①', '②', '③', '④'],
                ['(A)', '(B)', '(C)', '(D)'],
                ['（A）', '（B）', '（C）', '（D）'],
                ['A.', 'B.', 'C.', 'D.'],
                ['A、', 'B、', 'C、', 'D、'],
                ['Ａ', 'Ｂ', 'Ｃ', 'Ｄ']
            ];

            for (const m of markersList) {
                const i1 = t.indexOf(m[0]);
                if (i1 === -1) continue;
                const i2 = t.indexOf(m[1], i1);
                if (i2 === -1) continue;
                const i3 = t.indexOf(m[2], i2);
                if (i3 === -1) continue;
                const i4 = t.indexOf(m[3], i3);
                if (i4 === -1) continue;

                if (m[0] === 'Ａ' && i1 > 0 && t.substring(i1 - 1, i1).includes('(')) continue;

                const o4Str = t.substring(i4 + m[3].length);
                const o4Matches = ['。', ' ', '\n', '，', '、', '；', '：', '？', '！'];
                let splitIdx = o4Str.length;
                for (const p of o4Matches) {
                    const pIdx = o4Str.indexOf(p);
                    if (pIdx > 0 && pIdx < splitIdx) splitIdx = pIdx;
                }

                let o4Final = o4Str.substring(0, splitIdx);
                let remTail = o4Str.substring(splitIdx).trim();

                if (remTail) {
                    remTail = remTail.replace(/^[。，、；：？！\s]+/, '').trim();
                }

                return {
                    q: t.substring(0, i1).trim(),
                    qp2: remTail ? remTail : '',
                    o1: t.substring(i1 + m[0].length, i2).trim(),
                    o2: t.substring(i2 + m[1].length, i3).trim(),
                    o3: t.substring(i3 + m[2].length, i4).trim(),
                    o4: o4Final.trim()
                };
            }
            return null;
        };

        const opts = extractOptions(fullText);
        if (opts) {
            currentObj.question = opts.q;
            currentObj.question_part2 = opts.qp2;
            currentObj.option_1 = opts.o1;
            currentObj.option_2 = opts.o2;
            currentObj.option_3 = opts.o3;
            currentObj.option_4 = opts.o4;
        } else {
            currentObj.question = fullText;
            currentObj.question_part2 = '';
        }

        // 去除最後的句號
        if (currentObj.option_4) {
            currentObj.option_4 = currentObj.option_4.replace(/。$/, '').trim();
        }

        if (currentObj.question && currentObj.option_1 && currentObj.option_2 && currentObj.answer >= 1 && currentObj.answer <= 4) {
            delete currentObj._rawText;
            questions.push(currentObj);
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.replace(/\s/g, '').includes('題號答案')) continue;

        const newFormatMatch = line.match(/^(\d+)\s+([1-4])(?:\s+(.*))?$/);
        const oldFormatMatch = line.match(/^(\d+)[\.、]\s*(.*)$/);

        let isNewStart = false;
        let qText = '';
        let qAns = null;

        if (newFormatMatch) {
            isNewStart = true;
            qAns = parseInt(newFormatMatch[2]);
            qText = newFormatMatch[3] || '';
        } else if (oldFormatMatch) {
            isNewStart = true;
            qText = oldFormatMatch[2] || '';
        }

        if (isNewStart) {
            pushCurrentObj();
            currentObj = {
                _rawText: qText,
                option_1: '', option_2: '', option_3: '', option_4: '',
                answer: qAns || 1,
                explanation: '',
                category: '題庫匯入',
                difficulty: 'medium'
            };
        } else if (currentObj) {
            if (currentObj._rawText) {
                currentObj._rawText += '\n' + line;
            } else {
                currentObj._rawText = line;
            }
        }
    }

    pushCurrentObj();

    return questions;
}
