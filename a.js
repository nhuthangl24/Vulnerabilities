const validScoreCh = ["A", "B", "C", "D", "F"];
const rows = document.querySelectorAll('.table-responsive table tbody tr');
const scores = [];
let currentSemester = '';

rows.forEach(row => {
    const cols = row.querySelectorAll('td');

    // Dòng tiêu đề kỳ học (thường chỉ có 1 cột, span full)
    if (cols.length === 1) {
        currentSemester = cols[0]?.innerText?.trim() || '';
        return;
    }

    // Dòng dữ liệu môn học
    if (cols.length >= 10) {
        if (!currentSemester) {
            console.warn('Không xác định được kỳ học:', row);
            return;
        }

        const text = (i) => cols[i]?.innerText?.trim() || "";
        const num = (i) => {
            const v = text(i);
            return v === "" ? null : parseFloat(v);
        };

        const scoreCh = text(9);

        const score = {
            id: text(0) ? parseInt(text(0)) : null,
            name: text(1) || null,
            countTC: num(2),
            countLH: num(3),
            scoreCC: num(4),
            scoreBT: num(5),
            scoreGK: num(6),
            scoreCK: num(7),
            scoreT10: num(8),
            scoreCh: validScoreCh.includes(scoreCh) ? scoreCh : null,
            scoreChChange: null,
            semester: currentSemester
        };

        scores.push(score);
    }
});

// 🔝 Lấy điểm cao nhất nếu học lại cùng môn
const highestScores = {};

scores.forEach(s => {
    if (!s.name) return;
    if (
        !highestScores[s.name] ||
        (s.scoreT10 !== null && s.scoreT10 > highestScores[s.name].scoreT10)
    ) {
        highestScores[s.name] = s;
    }
});

const filteredScores = Object.values(highestScores);

// 💾 Xuất file JSON
const blob = new Blob([JSON.stringify(filteredScores, null, 2)], {
    type: 'application/json'
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'scores.json';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
