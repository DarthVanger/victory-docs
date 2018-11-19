import React from "react";
// ../static/logos/favicon.ico
//   {this.props.headComponents}
export default ({ Html, Head, Body, children, siteData, renderMeta }) => (
  <Html lang="en">
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="shortcut icon" href="../static/logos/favicon.ico" />
      {/* Fonts */}
      <link
        href="https://formidable.com/open-source/fonts.css"
        rel="stylesheet"
        type="text/css"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Playfair+Display:400,400i"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Andada"
        rel="stylesheet"
      />

      {/* CodeMirror for Component Playgrounds */}
      <link
        rel="stylesheet"
        href="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.0.0/codemirror.min.css"
      />
    </Head>
    <Body>{children}</Body>
  </Html>
);
