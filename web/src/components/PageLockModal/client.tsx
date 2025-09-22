'use client'

import React, { useEffect, useState } from "react"
import { createPortal } from 'react-dom';
import { useFormFields } from "@payloadcms/ui";
import axios from "axios"

import './index.scss'

export default function PageLockModalClient({ documentId, children, hidden }: { documentId: string, children: React.ReactNode, hidden?: Boolean }) {
  const [mounted, setMounted] = useState(false);

  const migrationTaskId = useFormFields(([fields, dispatch]) => fields.migrationTaskId);

  console.log("[PageLockModalClient] migrationTaskId", migrationTaskId?.value);




  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     console.log('Checking if agent task is complete');

  //     const fetchStatus = async () => {
  //       try {
  //         const response = await axios.get(`api/pages/task/${migrationTaskId?.value}`);

  //         console.log("Agent task status:", response.data);

  //         // TODO: check if task is still running
  //         clearInterval(intervalId);

  //       } catch (error) {
  //         console.error(error.message);
  //       }
  //     };
  //     fetchStatus();

  //   }, 1000); // Every 1 second

  //   return () => clearInterval(intervalId); // Cleanup
  // }, []);

  // If there is a task running or if the client isn't mounted yet, don't show the modal
  if (!migrationTaskId?.value || !mounted) return null;

  return <div>This is the page lock modal</div>;

}
