import React from "react";
import { withRouteData, Link } from "react-static";
import Helmet from "react-helmet";
import config from "../../data/site-config";
import Seo from "../partials/seo/index";
import Footer from "../partials/footer";
import Playground from "../partials/playground";
import Layout from "../layouts";
import LayoutWithSidebar from "../layouts/with-sidebar";

class DocsTemplate extends React.Component {
  render() {
    const { title, contents } = this.props.doc;

    // Not 100% sure what this biz is about, but
    // if we need it for something, we can definitely
    // implement this in our data generation/transform
    // before it gets here

    // const postNode = this.props.doc.markdownRemark;
    // const post = postNode.frontmatter;
    // if (!post.id) {
    //   post.id = slug;
    // }
    // if (!post.id) {
    //   post.categoryId = config.postDefaultCategoryID;
    // }

    return (
      <LayoutWithSidebar
        children={this.props.children}
        location={this.props.location}
        sidebarContent={this.props.sidebarContent}
      >
        <Helmet>
          <title>{`${config.siteTitle} |  ${title}`}</title>
          <meta name="description" content={config.siteDescription} />
        </Helmet>
        <div className="Page-content">
          <article className="Article">
            <div className="Recipe Markdown">
              {/* TODO: Add edit this page link once everything is merged to master
              <a className="SubHeading" href="">Edit this page</a>
            */}
              <Playground html={contents} scope={null} theme="elegant" />
            </div>
          </article>
          <Footer />
        </div>
      </LayoutWithSidebar>
    );
  }
}

export default withRouteData(({ doc, location, sidebarContent }) => (
  <DocsTemplate doc={doc} location={location} sidebarContent={sidebarContent} />
));
