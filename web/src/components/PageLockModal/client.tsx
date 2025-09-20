'use client'

import React, { useEffect, useState } from "react"
import { createPortal } from 'react-dom';

import './index.scss'

export default function PageLockModalClient({ children, hidden }: { children: React.ReactNode, hidden?: Boolean }) {
  const [mounted, setMounted] = useState(false);

  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // If the 
  if (hidden || !mounted) return null;

  return createPortal(
    <div id="modal" className="modal">
      <div className="modal-content">
        <div id="modal-message">{children}</div>
      </div>
    </div>,
    document.body
  );
}
