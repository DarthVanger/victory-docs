import React from "react";
import PropTypes from "prop-types";
import { graphql, StaticQuery } from "gatsby";
import Header from "../partials/header";
import Sidebar from "../partials/sidebar";
import "../styles/styles.css";

export const query = graphql`
  query LayoutWithSidebarQuery {
    allMarkdownRemark(sort: { fields: [frontmatter___title], order: ASC }) {
      edges {
        node {
          fields {
            slug
            type
            raw
          }
          headings {
            depth
            value
          }
          frontmatter {
            id
            category
            display
            title
          }
        }
      }
    }
  }
`;


class LayoutWithSidebar extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <StaticQuery
        query={query}
        render={ (data) => {
          // The Sidebar’s scroll position remains unchanged when it lives here in the layout
          const allRecipes = data.allMarkdownRemark.edges;
          const themeGuideExists = allRecipes.find((recipe) => {
            return recipe.node.fields.slug === "/guides/themes/";
          });
          if (!themeGuideExists) {
            // Add /guides/themes/ to sidebar
            allRecipes.push({
              node: {
                fields: {
                  slug: "/guides/themes/",
                  type: "guides"
                },
                frontmatter: {
                  title: "Themes"
                }
              }
            });
          }
          return (<div className="Page-wrapper u-fullHeight">
            <Header home={false}/>
            <main className="Page">
              <div className="Page-sidebar">
                <Sidebar content={allRecipes} location={this.props.location}/>
              </div>
              {children}
            </main>
          </div>);
        }}
      />

    );
  }
}

LayoutWithSidebar.propTypes = {
  children: PropTypes.any,
  data: PropTypes.object,
  history: PropTypes.any,
  location: PropTypes.object
};

export default LayoutWithSidebar;