import React from "react";
import PropTypes from "prop-types";
import Header from "../../src/partials/header";
import Sidebar from "../../src/partials/sidebar";

// import "../../styles/styles.css";

class LayoutWithSidebar extends React.Component {
  render() {
    const { children, sidebarContent, location } = this.props;

    // The Sidebar’s scroll position remains unchanged when it lives here in the layout
    // const allRecipes = data.allMarkdownRemark.edges;
    // const themeGuideExists = allRecipes.find((recipe) => {
    //   return recipe.node.fields.slug === "/guides/themes/";
    // });
    // if (!themeGuideExists) {
    //   // Add /guides/themes/ to sidebar
    //   allRecipes.push({
    //     node: {
    //       fields: {
    //         slug: "/guides/themes/",
    //         type: "guides"
    //       },
    //       frontmatter: {
    //         title: "Themes"
    //       }
    //     }
    //   });
    // }

    return (
      <div className="Page-wrapper u-fullHeight">
        <main className="Page">
          <div className="Page-sidebar">
            <Sidebar content={sidebarContent} location={location} />
          </div>
          {children}
        </main>
      </div>
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

// this query takes care of sorting!! :magic:

// this function takes care of sorting!! :code:

// export const query = graphql`
//   query LayoutWithSidebarQuery {
//     allMarkdownRemark(sort: { fields: [frontmatter___title], order: ASC }) {
//       edges {
//         node {
//           fields {
//             slug
//             type
//             raw
//           }
//           headings {
//             depth
//             value
//           }
//           frontmatter {
//             id
//             category
//             display
//             title
//           }
//         }
//       }
//     }
//   }
// `;
