'use client'

import React from 'react'
import { SpoilerVault } from './ui/spoiler-vault'

interface SimpleMDXRendererProps {
  content: string
  htmlFallback: string
}

export function SimpleMDXRenderer({ content, htmlFallback }: SimpleMDXRendererProps) {
  // Check if content has SpoilerVault components
  const hasSpoilerVault = content.includes('<SpoilerVault')
  
  if (!hasSpoilerVault) {
    // Use HTML fallback if no SpoilerVault components
    return (
      <div 
        className="mdx-content" 
        dangerouslySetInnerHTML={{ __html: htmlFallback }} 
      />
    )
  }

  // Split content at SpoilerVault boundaries and process each part
  const parsedContent = React.useMemo(() => {
    try {
      // Find the SpoilerVault start position
      const spoilerStart = content.indexOf('<SpoilerVault')
      const spoilerEnd = content.indexOf('</SpoilerVault>') + '</SpoilerVault>'.length
      
      if (spoilerStart === -1 || spoilerEnd === -1) {
        return [
          <div 
            key="fallback"
            className="mdx-content"
            dangerouslySetInnerHTML={{ __html: htmlFallback }} 
          />
        ]
      }
      
      const parts: React.ReactElement[] = []
      
      // Content before SpoilerVault - use the HTML fallback but truncate it properly
      const beforeContent = content.substring(0, spoilerStart).trim()
      
      if (beforeContent) {
        // Instead of complex matching, find the last safe section header in HTML
        // and cut the HTML there to prevent any spoiler content from appearing
        const safeEndMarkers = [
          '<h2>🔮 Habilidades Destacadas</h2>',
          '<h2 id="habilidades-destacadas">🔮 Habilidades Destacadas</h2>',
          'Habilidades Destacadas</h2>',
          'Usa aliados com precisão cirúrgica'
        ]
        
        let cutIndex = -1
        for (const marker of safeEndMarkers) {
          const markerIndex = htmlFallback.toLowerCase().indexOf(marker.toLowerCase())
          if (markerIndex !== -1) {
            // Find the end of this section
            const afterMarker = htmlFallback.slice(markerIndex + marker.length)
            const nextSection = afterMarker.search(/<h2|<\/article|$/)
            cutIndex = markerIndex + marker.length + (nextSection === -1 ? afterMarker.length : nextSection)
            break
          }
        }
        
        if (cutIndex > 0) {
          const safeHtmlContent = htmlFallback.substring(0, cutIndex)
          
          parts.push(
            <div 
              key="before-spoiler"
              className="mdx-content"
              dangerouslySetInnerHTML={{ __html: safeHtmlContent }} 
            />
          )
        }
      }
      
      // Extract SpoilerVault hash and content
      const spoilerVaultSection = content.substring(spoilerStart, spoilerEnd)
      const hashMatch = spoilerVaultSection.match(/hash="([^"]+)"/)
      const contentMatch = spoilerVaultSection.match(/<SpoilerVault[^>]*>([\s\S]*?)<\/SpoilerVault>/)
      
      if (hashMatch && contentMatch) {
        const hash = hashMatch[1]
        const spoilerContent = contentMatch[1]
        
        parts.push(
          <SpoilerVault key="spoiler-vault" hash={hash}>
            <SpoilerContent content={spoilerContent} />
          </SpoilerVault>
        )
      }
      
      // Content after SpoilerVault
      const afterContent = content.substring(spoilerEnd).trim()
      
      if (afterContent) {
        // For after content, look for specific markers in the HTML
        const afterSectionMarkers = [
          'Aparições na Campanha',
          'Momentos Importantes',
          'Relacionamentos'
        ]
        
        let afterHtmlContent = ''
        
        for (const marker of afterSectionMarkers) {
          const markerIndex = htmlFallback.toLowerCase().indexOf(marker.toLowerCase())
          if (markerIndex !== -1) {
            // Get content from this marker to the end
            const fromMarker = htmlFallback.substring(markerIndex)
            
            // Find the start of the section (usually has an h2 tag before the text)
            const sectionStart = htmlFallback.lastIndexOf('<h2', markerIndex)
            if (sectionStart !== -1) {
              afterHtmlContent = htmlFallback.substring(sectionStart)
              break
            } else {
              // Fallback: use from marker directly
              afterHtmlContent = fromMarker
              break
            }
          }
        }
        
        if (afterHtmlContent) {
          parts.push(
            <div 
              key="after-spoiler"
              className="mdx-content"
              dangerouslySetInnerHTML={{ __html: afterHtmlContent }} 
            />
          )
        } else {
          // Fallback: try the original approach
          const htmlForAfterContent = findHTMLForContent(afterContent, htmlFallback)
          if (htmlForAfterContent) {
            parts.push(
              <div 
                key="after-spoiler"
                className="mdx-content"
                dangerouslySetInnerHTML={{ __html: htmlForAfterContent }} 
              />
            )
          }
        }
      }
      
      return parts.length > 0 ? parts : [
        <div 
          key="fallback"
          className="mdx-content"
          dangerouslySetInnerHTML={{ __html: htmlFallback }} 
        />
      ]
    } catch (error) {
      console.error('Error parsing MDX content:', error)
      return [
        <div 
          key="error-fallback"
          className="mdx-content"
          dangerouslySetInnerHTML={{ __html: htmlFallback }} 
        />
      ]
    }
  }, [content, htmlFallback])

  return <div>{parsedContent}</div>
}

// Helper function to find HTML content for a markdown section
function findHTMLForContent(markdownContent: string, fullHTML: string): string {
  if (!markdownContent.trim()) return ''
  
  // CRITICAL: Check if this markdown content contains any spoiler-related text
  const spoilerIndicators = [
    'Segredos e Mistérios',
    'INFORMAÇÕES CONFIDENCIAIS',
    'SPOILERS PARA JOGADORES',
    'Rancor contra outras raças',
    'Objetivo Real',
    'Escolha Contra o General',
    'Máscaras e Manipulação',
    'Plano de Longo Prazo'
  ]
  
  for (const indicator of spoilerIndicators) {
    if (markdownContent.includes(indicator)) {
      return '' // Return empty to prevent spoiler content from appearing
    }
  }
  
  // Look for the last substantial section header to ensure we stop before spoilers
  const lastSection = markdownContent.match(/## ([^#\n]+)(?=\n)/g)
  if (lastSection) {
    const lastSectionTitle = lastSection[lastSection.length - 1]
    
    // If the last section is about abilities/skills, that's safe
    if (lastSectionTitle.includes('Habilidades') || lastSectionTitle.includes('Aurora Branca')) {
      // Find this section in the HTML and stop there
      const sectionText = lastSectionTitle.replace(/##\s*/, '').trim()
      const sectionIndex = fullHTML.toLowerCase().indexOf(sectionText.toLowerCase())
      
      if (sectionIndex !== -1) {
                 // Find the end of this section (next h2 or end of content)
         const nextSectionMatch = fullHTML.slice(sectionIndex + sectionText.length).match(/<h2|<\/article|$/)
         const nextSectionIndex = nextSectionMatch && nextSectionMatch.index !== undefined ? 
           sectionIndex + sectionText.length + nextSectionMatch.index : 
           fullHTML.length
          
        // Get content up to this point, but ensure we have complete HTML tags
        const beforeSectionStart = Math.max(0, fullHTML.lastIndexOf('<', sectionIndex))
        const afterSectionEnd = Math.min(fullHTML.length, nextSectionIndex)
        
        const result = fullHTML.slice(beforeSectionStart, afterSectionEnd)
        return result
      }
    }
  }
  
  // Fallback: look for distinctive safe text only
  const safeLines = markdownContent.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed.length > 10 && 
           !trimmed.includes('Segredos') && 
           !trimmed.includes('CONFIDENCIAL') &&
           !trimmed.includes('Rancor') &&
           !trimmed.includes('*"Nem tudo o que é belo é puro')
  })
  
  for (const line of safeLines.slice(-3)) { // Check last 3 safe lines
    const searchText = line
      .replace(/[#*_>`\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 30)
    
    if (searchText.length > 5) {
      const index = fullHTML.toLowerCase().indexOf(searchText.toLowerCase())
      if (index !== -1) {
        // Find a reasonable start and end that doesn't include spoiler content
        const beforeStart = Math.max(0, fullHTML.lastIndexOf('<', index))
        const afterEnd = fullHTML.indexOf('>', index + searchText.length)
        
        if (beforeStart !== -1 && afterEnd !== -1) {
          const potentialContent = fullHTML.slice(beforeStart, afterEnd + 1)
          
          // Double-check this content doesn't contain spoiler text
          const containsSpoiler = spoilerIndicators.some(indicator => 
            potentialContent.toLowerCase().includes(indicator.toLowerCase())
          )
          
          if (!containsSpoiler) {
            return potentialContent
          }
        }
      }
    }
  }
  
  return ''
}

// Component to handle markdown content inside SpoilerVault
function SpoilerContent({ content }: { content: string }) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {content.split('\n').map((line, index) => {
        const trimmedLine = line.trim()
        
        // Handle headers
        if (trimmedLine.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{trimmedLine.substring(4)}</h3>
        }
        if (trimmedLine.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{trimmedLine.substring(3)}</h2>
        }
        if (trimmedLine.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{trimmedLine.substring(2)}</h1>
        }
        
        // Handle bold text
        if (trimmedLine.includes('**')) {
          const processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          return (
            <p key={index} className="my-4" dangerouslySetInnerHTML={{ __html: processedLine }} />
          )
        }
        
        // Handle italic text
        if (trimmedLine.includes('*') && !trimmedLine.includes('**')) {
          const processedLine = trimmedLine.replace(/\*(.*?)\*/g, '<em>$1</em>')
          return (
            <p key={index} className="my-4" dangerouslySetInnerHTML={{ __html: processedLine }} />
          )
        }
        
        // Handle blockquotes
        if (trimmedLine.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-orange-500 pl-4 my-4 italic">
              {trimmedLine.substring(2)}
            </blockquote>
          )
        }
        
        // Handle numbered lists
        if (trimmedLine.match(/^\d+\.\s/)) {
          return <li key={index} className="ml-4 list-decimal">{trimmedLine.replace(/^\d+\.\s/, '')}</li>
        }
        
        // Regular paragraphs
        if (trimmedLine) {
          return <p key={index} className="my-4">{trimmedLine}</p>
        }
        
        // Empty lines for spacing
        return null
      })}
    </div>
  )
} 