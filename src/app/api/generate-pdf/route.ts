import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// For Vercel deployment, we'll need to handle this differently

export async function POST(request: NextRequest) {
  let browser = null
  try {
    const { testData, config } = await request.json()
    
    console.log('PDF generation started for test:', testData.name)
    console.log('Config:', config)
    
    // Use regular puppeteer for local development
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--disable-web-security'
      ]
    })

    const page = await browser.newPage()
    
    // Generate HTML content with perfect LaTeX rendering
    const htmlContent = generatePDFHTML(testData, config)
    
    console.log('Setting page content...')
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })

    console.log('Waiting for LaTeX to render...')
    // Wait for LaTeX to render completely
    try {
      await page.waitForFunction(() => {
        const mathElements = document.querySelectorAll('.katex')
        console.log('Found', mathElements.length, 'KaTeX elements')
        return Array.from(mathElements).every(el => 
          el.querySelector('.katex-mathml') !== null
        )
      }, { timeout: 15000 })
    } catch (error) {
      console.log('LaTeX rendering timeout, proceeding anyway...')
    }

    // Additional wait to ensure all LaTeX is fully rendered
    await page.waitForTimeout(3000)

    console.log('Generating PDF...')
    // Generate PDF with high quality settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: `${config.margins || 20}mm`,
        right: `${config.margins || 20}mm`,
        bottom: `${config.margins || 20}mm`,
        left: `${config.margins || 20}mm`
      },
      displayHeaderFooter: config.showPageNumbers || false,
      headerTemplate: config.showHeader ? generateHeaderTemplate(testData) : '',
      footerTemplate: config.showFooter ? generateFooterTemplate() : '',
    })

    console.log('PDF generated successfully, size:', pdf.length, 'bytes')
    
    if (browser) {
      await browser.close()
    }

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${testData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

function generatePDFHTML(testData: any, config: any) {
  const fontFamily = config.fontFamily || 'Helvetica, Arial, sans-serif'
  const fontSize = config.fontSize || 12
  const lineHeight = config.lineHeight || 1.5
  const questionsPerPage = config.questionsPerPage || 2

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${testData.name}</title>
      
      <!-- KaTeX CSS and JS for LaTeX rendering -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
      
      <!-- Custom styles -->
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ${fontFamily};
          font-size: ${fontSize}px;
          line-height: ${lineHeight};
          color: #333;
          background: white;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .question {
          margin-bottom: 30px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafafa;
        }
        
        .question-number {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        
        .question-text {
          margin-bottom: 15px;
          line-height: 1.6;
        }
        
        .options {
          margin-left: 20px;
        }
        
        .option {
          margin-bottom: 8px;
          padding: 5px 0;
        }
        
        .option-label {
          font-weight: bold;
          margin-right: 8px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .test-title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        
        .test-info {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          font-size: 14px;
          color: #6b7280;
        }
        
        .instructions {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #3b82f6;
        }
        
        .marking-scheme {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #f59e0b;
        }
        
        .answer-key {
          background: #d1fae5;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
          border-left: 4px solid #10b981;
        }
        
        .solutions {
          background: #e0f2fe;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
          border-left: 4px solid #0ea5e9;
        }
        
        /* Ensure LaTeX renders properly */
        .katex {
          font-size: inherit;
        }
        
        .katex-display {
          margin: 20px 0;
          text-align: center;
        }
      </style>
    </head>
    <body>
      ${generateTestContent(testData, config)}
      
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          renderMathInElement(document.body, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\[', right: '\\]', display: true},
              {left: '\\(', right: '\\)', display: false}
            ],
            throwOnError: false
          });
        });
      </script>
    </body>
    </html>
  `
}

function generateTestContent(testData: any, config: any) {
  let content = ''
  
  // Header
  if (config.showHeader) {
    content += `
      <div class="header">
        <div class="test-title">${testData.name}</div>
        ${testData.description ? `<div style="font-size: 16px; color: #6b7280; margin-bottom: 15px;">${testData.description}</div>` : ''}
        <div class="test-info">
          ${config.showTotalQuestions ? `<div>Total Questions: ${testData.questions?.length || 0}</div>` : ''}
          ${config.showFullMarks ? `<div>Total Marks: ${testData.questions?.reduce((sum: number, q: any) => sum + (q.marks || 1), 0) || 0}</div>` : ''}
          <div>Duration: ${testData.total_time_minutes || 0} minutes</div>
        </div>
      </div>
    `
  }

  // Instructions
  if (config.showInstructions) {
    content += `
      <div class="instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Read all questions carefully before answering</li>
          <li>All questions are compulsory</li>
          <li>Use black or blue ink only</li>
          <li>Show all working for mathematical problems</li>
        </ul>
      </div>
    `
  }

  // Marking Scheme
  if (config.showMarkingScheme) {
    content += `
      <div class="marking-scheme">
        <h3>Marking Scheme:</h3>
        <ul>
          <li>Each question carries equal marks</li>
          <li>Partial credit may be awarded for correct methodology</li>
          <li>Negative marking may apply for incorrect answers</li>
        </ul>
      </div>
    `
  }

  // Questions
  if (testData.questions && testData.questions.length > 0) {
    testData.questions.forEach((question: any, index: number) => {
      if (index > 0 && config.questionsPerPage && index % config.questionsPerPage === 0) {
        content += '<div class="page-break"></div>'
      }
      
      content += `
        <div class="question">
          <div class="question-number">Question ${index + 1} ${question.marks ? `(${question.marks} marks)` : ''}</div>
          <div class="question-text">${renderLatex(question.question_text || '')}</div>
          ${question.options && question.options.length > 0 ? `
            <div class="options">
              ${question.options.map((option: any, optIndex: number) => `
                <div class="option">
                  <span class="option-label">${String.fromCharCode(65 + optIndex)}.</span>
                  ${renderLatex(option)}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `
    })
  }

  // Answer Key
  if (config.showAnswerKey && testData.questions) {
    content += `
      <div class="page-break"></div>
      <div class="answer-key">
        <h2>Answer Key</h2>
        ${testData.questions.map((question: any, index: number) => `
          <div style="margin-bottom: 10px;">
            <strong>Q${index + 1}:</strong> 
            ${question.correct_answer ? String.fromCharCode(65 + question.correct_answer) : 'Not specified'}
          </div>
        `).join('')}
      </div>
    `
  }

  // Solutions
  if (config.showSolutions && testData.questions) {
    content += `
      <div class="page-break"></div>
      <div class="solutions">
        <h2>Solutions</h2>
        ${testData.questions.map((question: any, index: number) => `
          <div style="margin-bottom: 20px;">
            <h4>Question ${index + 1}:</h4>
            <div>${renderLatex(question.solution || 'Solution not provided')}</div>
          </div>
        `).join('')}
      </div>
    `
  }

  return content
}

function renderLatex(text: string) {
  if (!text) return ''
  
  // Enhanced LaTeX rendering with proper KaTeX integration
  return text
    // Handle display math ($$...$$)
    .replace(/\$\$(.*?)\$\$/gs, '<div class="katex-display">$1</div>')
    // Handle inline math ($...$)
    .replace(/\$(.*?)\$/g, '<span class="katex-inline">$1</span>')
    // Handle bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle line breaks
    .replace(/\n/g, '<br>')
}

function generateHeaderTemplate(testData: any) {
  return `
    <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
      ${testData.name} - Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>
  `
}

function generateFooterTemplate() {
  return `
    <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
      Generated on ${new Date().toLocaleDateString()}
    </div>
  `
}
