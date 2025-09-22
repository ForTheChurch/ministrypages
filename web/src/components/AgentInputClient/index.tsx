'use client'

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { Payload, UIField } from "payload"
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import axios from "axios"
import Modal from "./modal"

const getLabelAsString = (label?: Record<string, string> | string) => {
  return typeof label === "string" ? label : "";
};

function AgentInputClient({ field }: { field?: UIField }) {
  const label = field?.label;

  const migrationTaskIdField = useFormFields(([fields, dispatch]) => fields.migrationTaskId);
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [activeTaskId, setActiveTaskId] = useState(migrationTaskIdField?.value || "");



  const { id } = useDocumentInfo();
  const documentId = id;

  const reload = () => {
    console.log("Reloading page");
    window.location.reload();
  };

  const handleSubmit = async () => {
    axios.post("/api/jobs", {
      workflow: "convertSinglePage",
      data: { documentId, url },
    }).then((response) => {
      console.log("Job created:", response.data);
      reload();
    }).catch((error) => {
      console.error("Error creating job:", error);
    })
  };

  const wasConversionInProgress = migrationTaskIdField?.value;
  const getActiveConversionTaskId = async () => {
    const result = await axios.get(`/api/pages/${documentId}`);
    const { migrationTaskId } = result.data;
    return migrationTaskId;
  }

  // Update the mounted status
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);


  // Wait for the conversion to complete
  useEffect(() => {
    if (!wasConversionInProgress) return;

    let interval = setInterval(async () => {
      const migrationTaskId = await getActiveConversionTaskId();
      setActiveTaskId(migrationTaskId);
      console.log("[AgentInputClient] Updated migrationTaskId: ", migrationTaskId);
      if (!migrationTaskId) {
        clearInterval(interval);
        reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const createModal = () => {
    console.log("Creating a modal");
    return createPortal(
      <Modal>
        <p>A conversion is in progress. This page will automatically refresh when the task is complete.</p>
        <button>Go to Pages</button>
        <button>Cancel Task</button>
      </Modal>,
      document.body
    );
  }
  return (<>
    {mounted && activeTaskId && createModal()}
    <div>
      {label && <label htmlFor="inputMigratePageUrl">{getLabelAsString(label)}</label>}
      <div>
        <input
          id="inputMigratePageUrl"
          placeholder="Enter the URL of a page to migrate"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSubmit}
        >Migrate</button>
      </div>
    </div>
  </>
  );
}

export default AgentInputClient
