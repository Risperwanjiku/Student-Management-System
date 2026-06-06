import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RESULTS_URL = 'http://localhost:5000/api/results';
const STREAMS_URL = 'http://localhost:5000/api/class-streams';

// colors for the PDF documents
const REPORT_COLOR = [30, 58, 95];    // navy for headers and numbers
const REPORT_TINT = [232, 238, 245];  // light blue for the stat cards

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return n + 'th';
}

function Reports() {
  const [streams, setStreams] = useState([]);
  const [streamId, setStreamId] = useState('');
  const [streamName, setStreamName] = useState('');
  const [term, setTerm] = useState('1');
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [subjectPositions, setSubjectPositions] = useState({});

  useEffect(() => {
    fetchStreams();
  }, []);

  useEffect(() => {
    if (streamId) {
      fetchResults();
    } else {
      setResults([]);
      setSubjects([]);
    }
  }, [streamId, term]);

  const fetchStreams = async () => {
    const res = await fetch(STREAMS_URL);
    setStreams(await res.json());
  };

  const fetchResults = async () => {
    const res = await fetch(`${RESULTS_URL}?stream_id=${streamId}&term=${term}&year=2026`);
    const data = await res.json();
    setSubjects(data.subjects);
    setResults(data.results);
    setSubjectPositions(data.subjectPositions);
    const stream = streams.find((s) => String(s.id) === String(streamId));
    setStreamName(stream ? stream.name : '');
  };

  const classAverage = () => {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + r.average, 0);
    return Math.round((sum / results.length) * 100) / 100;
  };

  const downloadClassReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // navy header band
    doc.setFillColor(...REPORT_COLOR);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255);
    doc.setFontSize(18);
    doc.text('Ikonex Academy', pageWidth / 2, 14, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Class Performance Report - ${streamName} (Term ${term}, 2026)`, pageWidth / 2, 22, { align: 'center' });
    doc.setTextColor(0);

    const head = [['Pos', 'Student', 'Adm No', ...subjects.map((s) => s.name), 'Total', 'Average', 'Grade']];
    const body = results.map((r) => [
      ordinal(r.position),
      r.name,
      r.admission_no,
      ...subjects.map((s) => (r.subjectMarks[s.id] !== null ? r.subjectMarks[s.id] : '-')),
      r.total,
      r.average,
      r.grade,
    ]);
    autoTable(doc, { head, body, startY: 38, headStyles: { fillColor: REPORT_COLOR } });

    // summary line under the table
    const y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Class Average: ${classAverage()}     Students: ${results.length}`, 14, y);

    doc.save(`class-report-${streamName}.pdf`);
  };

  const downloadReportCard = (student) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // navy header band
    doc.setFillColor(...REPORT_COLOR);
    doc.rect(0, 0, pageWidth, 32, 'F');
    doc.setTextColor(255);
    doc.setFontSize(20);
    doc.text('Ikonex Academy', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('OFFICIAL STUDENT REPORT CARD', pageWidth / 2, 23, { align: 'center' });
    doc.setTextColor(0);

    // student info
    doc.setFontSize(11);
    doc.text(`Name: ${student.name}`, 14, 46);
    doc.text(`Admission No: ${student.admission_no}`, 14, 53);
    doc.text(`Stream: ${streamName}`, 120, 46);
    doc.text(`Term: Term ${term}, 2026`, 120, 53);

    // subject table
    doc.setFontSize(13);
    doc.text('Academic Performance', 14, 67);

    const rows = subjects.filter((s) => student.subjectMarks[s.id] !== null);
    const head = [['Subject', 'Mark', 'Grade', 'Position']];
    const body = rows.map((s) => [
      s.name,
      student.subjectMarks[s.id],
      student.subjectGrades[s.id],
      ordinal(subjectPositions[s.id]?.[student.student_id]),
    ]);
    autoTable(doc, { head, body, startY: 72, headStyles: { fillColor: REPORT_COLOR } });

    const maxTotal = rows.length * 100;

    // three stat cards
    let y = doc.lastAutoTable.finalY + 14;
    const boxes = [
      { label: 'TOTAL MARKS', value: `${student.total}`, sub: `out of ${maxTotal}` },
      { label: 'AVERAGE', value: `${student.average}%`, sub: `Class Avg: ${classAverage()}` },
      { label: 'POSITION', value: ordinal(student.position), sub: `of ${results.length}` },
    ];
    const boxW = 56;
    const boxH = 28;
    const xs = [14, 77, 140];
    boxes.forEach((b, i) => {
      doc.setFillColor(...REPORT_TINT);
      doc.roundedRect(xs[i], y, boxW, boxH, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(b.label, xs[i] + boxW / 2, y + 7, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(...REPORT_COLOR);
      doc.text(b.value, xs[i] + boxW / 2, y + 17, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(b.sub, xs[i] + boxW / 2, y + 24, { align: 'center' });
    });
    doc.setTextColor(0);

    // overall grade
    y = y + boxH + 12;
    doc.setFontSize(12);
    doc.text(`Overall Grade: ${student.grade}`, 14, y);

    // signature lines
    y = y + 26;
    doc.setFontSize(11);
    doc.text('Class Teacher: ____________________', 14, y);
    doc.text('Principal: ____________________', 120, y);

    // footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('This is a system generated report.', pageWidth / 2, y + 22, { align: 'center' });
    doc.setTextColor(0);

    doc.save(`report-card-${student.name}.pdf`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reports</h2>
          <p className="page-sub">Download PDF reports for a class.</p>
        </div>
        {results.length > 0 && (
          <button className="btn-primary" onClick={downloadClassReport}>Download Class Report</button>
        )}
      </div>

      <div className="filter-card">
        <div className="filter-field">
          <label>Class Stream</label>
          <select value={streamId} onChange={(e) => setStreamId(e.target.value)}>
            <option value="">Select class stream</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Term</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="1">Term 1, 2026</option>
            <option value="2">Term 2, 2026</option>
            <option value="3">Term 3, 2026</option>
          </select>
        </div>
      </div>

      {streamId && results.length === 0 && (
        <p className="page-sub">No results to report for this stream yet.</p>
      )}

      {results.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Average</th>
                <th>Grade</th>
                <th>Report Card</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.student_id}>
                  <td><span className={r.position === 1 ? 'rank-badge top' : 'rank-badge'}>{r.position}</span></td>
                  <td>
                    <div className="student-cell">
                      <span className="avatar">{getInitials(r.name)}</span>
                      <div>
                        <div className="student-name">{r.name}</div>
                        <div className="student-id">{r.admission_no}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.average}%</td>
                  <td><span className="grade-pill">{r.grade}</span></td>
                  <td>
                    <button className="btn-link" onClick={() => downloadReportCard(r)}>Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reports;