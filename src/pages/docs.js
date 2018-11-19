import React from "react";
import { withRouteData, Link } from "react-static";

// TODO: worth noting we're recreating the sidebar, essentially

export default withRouteData(({ docs, location }) => (
  <div>
    <div>{location}</div>
    <h1 className="Article">It's Docs time.</h1>
    <br />
    All Docs
    <ul>
      {docs.map(doc => (
        <li key={doc.slug}>
          <Link to={`/docs/${doc.slug}/`}>{doc.title}</Link>
        </li>
      ))}
    </ul>
  </div>
));
