'use client'

import { useMemo } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { components } from './mdx-components'

interface MDXRendererProps {
  mdxSource: string
  content: string
}

export function MDXRenderer({ mdxSource, content }: MDXRendererProps) {
  const Component = useMemo(() => {
    if (!mdxSource || mdxSource.trim() === '') {
      // Fallback to HTML content
      return () => (
        <div 
          className="mdx-content" 
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      )
    }

    try {
      // Create function from MDX source
      const fn = new Function('React', 'jsx', 'jsxs', 'Fragment', mdxSource)
      
      // Get React dependencies
      const React = require('react')
      const { jsx, jsxs, Fragment } = require('react/jsx-runtime')
      
      // Execute the function to get the component
      const MDXContent = fn(React, jsx, jsxs, Fragment)
      
      return () => (
        <MDXProvider components={components}>
          <div className="mdx-content">
            <MDXContent />
          </div>
        </MDXProvider>
      )
    } catch (error) {
      console.error('Error rendering MDX:', error)
      // Fallback to HTML
      return () => (
        <div 
          className="mdx-content" 
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      )
    }
  }, [mdxSource, content])

  return <Component />
} 