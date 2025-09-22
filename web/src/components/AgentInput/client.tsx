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


const reloadPage = () => {
  window.location.reload();
};

const navigate = (url: string) => {
  window.location.href = url;
  
}

const createModal = () => {
  const onClickGoToPages = () => {
    navigate("/admin/collections/pages");
  };

  const onClickCancelTask = () => {

  };

  return createPortal(
    <Modal>
      <p>A conversion is in progress. This page will automatically refresh when the task is complete.</p>
      <button onClick={onClickGoToPages}>Go to Pages</button>
      <button onClick={onClickCancelTask}>Cancel Task</button>
    </Modal>,
    document.body
  );
}

function AgentInputClient({ field }: { field?: UIField }) {
  const label = field?.label;

  const conversionTaskIdField = useFormFields(([fields, dispatch]) => fields.conversionTaskId);
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [activeTaskId, setActiveTaskId] = useState(conversionTaskIdField?.value || "");

  const { id } = useDocumentInfo();
  const documentId = id;

  // TODO: Make this more robust
  //  - Handle dirty form
  //  - Handle existing conversion task
  //  - Better error handling
  const handleSubmit = async () => {
    axios.post("/api/jobs", {
      workflow: "convertSinglePage",
      data: { documentId, url },
    }).then((response) => {
      console.log("Job created:", response.data);
      reloadPage();
    }).catch((error) => {
      console.error("Error creating job:", error);
    })
  };

  const wasConversionInProgress = conversionTaskIdField?.value;
  const getActiveConversionTaskId = async () => {
    const result = await axios.get(`/api/pages/${documentId}`);
    const { conversionTaskId } = result.data;
    return conversionTaskId;
  }

  // Update the mounted status
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);


  // Poll once every second for conversion complete and then reload
  useEffect(() => {
    // For starters, only poll if the page was loaded with an active conversion task
    if (!wasConversionInProgress) return;

    let intervalId = setInterval(async () => {
      const conversionTaskId = await getActiveConversionTaskId();
      setActiveTaskId(conversionTaskId);
      console.log("[AgentInputClient] Updated conversionTaskId: ", conversionTaskId);
      if (!conversionTaskId) {
        clearInterval(intervalId);
        reloadPage();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);


  return (<>
    {mounted && activeTaskId && createModal()}
    <div>
      {label && <label htmlFor="inputConversionPageUrl">{getLabelAsString(label)}</label>}
      <div>
        <input
          id="inputConversionPageUrl"
          placeholder="Enter the URL of a page to convert"
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
