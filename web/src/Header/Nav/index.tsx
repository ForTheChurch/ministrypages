'use client'

import React, { useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Menu, SearchIcon, X } from 'lucide-react'
import Link from 'next/link'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="hidden md:flex gap-3 items-center">
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} appearance="link" />
        })}
        <Link href="/search">
          <span className="sr-only">Search</span>
          <SearchIcon className="w-5 text-current" />
        </Link>
      </nav>

      {/* Mobile Navigation Toggle */}
      <button
        className="md:hidden z-10 p-2 rounded-full hover:bg-muted transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMenuOpen ? (
          <X className="w-6 h-6 text-foreground/80" />
        ) : (
          <Menu className="w-6 h-6 text-foreground/80" />
        )}
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute top-0 bg-background left-0 right-0 shadow-md pt-20 pb-4 md:hidden">
          <div className="container">
            <nav className="flex flex-col gap-4">
              {navItems.map(({ link }, i) => {
                return (
                  <div key={i} onClick={handleLinkClick}>
                    <CMSLink
                      {...link}
                      appearance="link"
                      className="text-foreground/80 hover:text-primary transition-colors font-medium py-2 px-2 block"
                    />
                  </div>
                )
              })}
              <Link
                href="/search"
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                onClick={handleLinkClick}
              >
                <SearchIcon className="w-5 h-5" />
                <span>Search</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
