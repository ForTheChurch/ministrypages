'use client'

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { Payload, UIField, Where } from "payload"
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import axios from "axios"
import { stringify } from "qs-esm"
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

const getActiveConversionTask = async (documentId: string) => {
  const query: Where = {
    agentTaskStatus: { in: "queued,running" },
  };
  const queryString = stringify(
    {
      where: query,
      limit: 1,
      sort: "-createdAt"
    },
    { addQueryPrefix: true },
  );

  try {
    const result = await axios.get(`/api/single-page-conversion-tasks/${documentId}${queryString}`);
    const { doc } = result.data;
    return doc;
  } catch (error) {
    if (error.status == 404) {
      return null;
    }
  }
}

const isAgentTaskActive = (agentTask) => {
  const agentTaskStatus = agentTask?.agentTaskStatus;
  return (agentTaskStatus == "queued") || (agentTaskStatus == "running");
}

function ConvertSinglePageClient({ field }: { field?: UIField }) {
  const label = field?.label;

  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [activeConversion, setActiveConversion] = useState({});

  const { id } = useDocumentInfo();
  const documentId = id;

  // TODO: Make this more robust
  //  - Handle dirty form
  //  - Handle existing conversion task
  //  - Better error handling
  const handleSubmit = async () => {
    axios.post("/api/single-page-conversion-tasks", {
      workflow: "convertSinglePage",
      data: { documentId, url },
    }).then((response) => {
      reloadPage();
    }).catch((error) => {
      console.error("Error creating job:", error);
    })
  };

  // Update the mounted status
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Get the initial active conversion
  useEffect(() => {
    getActiveConversionTask(documentId).then(task => setActiveConversion(task));
  }, []);


  // Poll once every second for conversion complete and then reload
  useEffect(() => {
    if (!isAgentTaskActive(activeConversion)) return;

    let intervalId = setInterval(async () => {
      const conversionTask = await getActiveConversionTask(documentId);
      setActiveConversion(conversionTask);
      if (!isAgentTaskActive(conversionTask)) {
        clearInterval(intervalId);
        reloadPage();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeConversion]);


  return (<>
    {mounted && isAgentTaskActive(activeConversion) && createModal()}
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
        >Convert</button>
      </div>
      <div>
        <label>Task status</label>
        <input value={activeConversion?.agentTaskStatus || "No task running"} disabled />
      </div>
    </div>
  </>
  );
}

export default ConvertSinglePageClient
