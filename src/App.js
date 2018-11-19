import React from "react";
import { Router, Route, Link } from "react-static";
import VictoryHeader from "./partials/header";
// /Users/Duncan/neogitz/sanity-check/src/partials/header.js
import Routes from "react-static-routes";

import "./app.css";

/*
        <Link to="/about">ABOUT </Link>
        <Link to="/docs">DOCS </Link>
        <Link to="/faq">FAQ </Link>
        <Link to="/gallery">GALLERY </Link>
        <a href='https://gitter.im/FormidableLabs/victory'>SUPPORT </a>
        <a href='https://github.com/FormidableLabs/victory'>GITHUB </a>
        <Link to="/blog">TEST (Blog)</Link>
 */

const App = () => (
  <Router>
    <div>
      <VictoryHeader />
      <Routes>{RenderRoutes}</Routes>
      <div className="content" />
    </div>
  </Router>
);

export default App;

// This is the default renderer for `<Routes>`
const RenderRoutes = ({ getComponentForPath }) => (
  // The default renderer uses a catch all route to receive the pathname
  <Route
    path="*"
    render={props => {
      // The pathname is used to retrieve the component for that path
      const Comp = getComponentForPath(props.location.pathname);
      // The component is rendered!
      return <Comp key={props.location.pathname} {...props} />;
    }}
  />
);

// export default () => (
//   <Router>
//     // pass a component (class or SFC)
//     <Routes component={RenderRoutes} />
//     // or, pass a render function
//     <Routes render={RenderRoutes} />
//     // or, pass a function as a child
//     <Routes>{RenderRoutes}</Routes>
//   </Router>
// )
