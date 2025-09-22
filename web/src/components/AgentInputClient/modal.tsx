'use client'

import './modal.scss'

import React from "react";

export default function Modal({ children }: { children: React.ReactNode }) {
    return (
        <div id="modal" className="modal">
            <div className="modal-content">
                <div id="modal-message">{children}</div>
            </div>
        </div>
    );
}
