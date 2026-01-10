// data-ujian.js - Mock File for Exam Data Management
console.log('📊 Data Ujian module loaded (mock)');

const DataUjian = {
  init: function() {
    console.log('Initializing Data Ujian...');
    return Promise.resolve();
  },
  
  getExamResults: function() {
    console.log('Fetching exam results...');
    return Promise.resolve([
      { id: 1, student: 'Student 1', score: 85, status: 'Lulus' },
      { id: 2, student: 'Student 2', score: 92, status: 'Lulus' },
      { id: 3, student: 'Student 3', score: 45, status: 'Tidak Lulus' }
    ]);
  },
  
  exportResults: function(format = 'csv') {
    console.log(`Exporting results as ${format}...`);
    return Promise.resolve(`data_ujian_${Date.now()}.${format}`);
  }
};

window.DataUjian = DataUjian;