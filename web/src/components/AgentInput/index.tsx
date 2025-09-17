import React from "react"

import "./index.scss"

const AgentInput: React.FC = () => {
  return (
    <form action="">
      <div className="search-bar">
        <div className="search-filter"> 
          <input
            className="search-filter__input"
            name="query"
            placeholder="Enter the URL of a page to migrate" />
        </div>
        <div className="search-bar__actions">
          <button
            className="pill pill--style-light pill--size-small list-controls__toggle-columns pill--has-action pill--has-icon pill--align-icon-right"
            type="submit"
          >Migrate</button>

        </div>
      </div >
    </form>)
}

export default AgentInput
