import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RESULTS_URL = 'http://localhost:5000/api/results';
const STREAMS_URL = 'http://localhost:5000/api/class-streams';

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
  }, [streamId]);

  const fetchStreams = async () => {
    const res = await fetch(STREAMS_URL);
    setStreams(await res.json());
  };

  const fetchResults = async () => {
    const res = await fetch(`${RESULTS_URL}?stream_id=${streamId}`);
    const data = await res.json();
    setSubjects(data.subjects);
    setResults(data.results);
    setSubjectPositions(data.subjectPositions);
    const stream = streams.find((s) => String(s.id) === String(streamId));
    setStreamName(stream ? stream.name : '');
  };

  const downloadClassReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Ikonex Academy', 14, 18);
    doc.setFontSize(12);
    doc.text(`Class Performance Report - ${streamName}`, 14, 26);

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

    autoTable(doc, { head, body, startY: 32, headStyles: { fillColor: [194, 24, 91] } });
    doc.save(`class-report-${streamName}.pdf`);
  };

  const downloadReportCard = (student) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Ikonex Academy', 14, 18);
    doc.setFontSize(12);
    doc.text('Student Report Card', 14, 26);

    doc.setFontSize(11);
    doc.text(`Name: ${student.name}`, 14, 38);
    doc.text(`Admission No: ${student.admission_no}`, 14, 45);
    doc.text(`Class: ${streamName}`, 120, 38);
    doc.text('Term: 1, 2026', 120, 45);

    const head = [['Subject', 'Mark', 'Grade', 'Position']];
    const body = subjects
      .filter((s) => student.subjectMarks[s.id] !== null)
      .map((s) => [
        s.name,
        student.subjectMarks[s.id],
        student.subjectGrades[s.id],
        ordinal(subjectPositions[s.id]?.[student.student_id]),
      ]);

    autoTable(doc, { head, body, startY: 52, headStyles: { fillColor: [194, 24, 91] } });

    const y = doc.lastAutoTable.finalY + 10;
    doc.text(`Total: ${student.total}`, 14, y);
    doc.text(`Average: ${student.average}`, 14, y + 7);
    doc.text(`Overall Grade: ${student.grade}`, 14, y + 14);
    doc.text(`Class Position: ${ordinal(student.position)}`, 14, y + 21);

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

      <div className="filter-row">
        <select value={streamId} onChange={(e) => setStreamId(e.target.value)}>
          <option value="">Select class stream</option>
          {streams.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {results.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Student</th>
              <th>Admission No</th>
              <th>Average</th>
              <th>Grade</th>
              <th>Report Card</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.student_id}>
                <td>{ordinal(r.position)}</td>
                <td>{r.name}</td>
                <td>{r.admission_no}</td>
                <td>{r.average}</td>
                <td>{r.grade}</td>
                <td>
                  <button className="btn-link" onClick={() => downloadReportCard(r)}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Reports;