const React = require('react');
const ReactPDF = require('@react-pdf/renderer');
const fs = require('fs');
const path = require('path');

const PlaceholderDoc = () => {
    return React.createElement(ReactPDF.Document, {},
        // Page 1: Front Cover
        React.createElement(ReactPDF.Page, { size: 'A4', style: { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0f2f1' } },
            React.createElement(ReactPDF.Text, { style: { fontSize: 30, color: '#004d40' } }, "Placeholder Front Cover"),
            React.createElement(ReactPDF.Text, { style: { fontSize: 14, color: '#666', marginTop: 20 } }, "(Replace this file with Journal-Cover-User.pdf)")
        ),
        // Page 2: Back Cover
        React.createElement(ReactPDF.Page, { size: 'A4', style: { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0f2f1' } },
            React.createElement(ReactPDF.Text, { style: { fontSize: 30, color: '#004d40' } }, "Placeholder Back Cover")
        )
    );
};

const outputPath = path.resolve(__dirname, '../public/book-covers/Journal-Cover-User.pdf');

ReactPDF.renderToStream(React.createElement(PlaceholderDoc)).then(stream => {
    const file = fs.createWriteStream(outputPath);
    stream.pipe(file);
    file.on('finish', () => console.log('Placeholder PDF created at:', outputPath));
    file.on('error', (err) => console.error('Error writing file:', err));
});
