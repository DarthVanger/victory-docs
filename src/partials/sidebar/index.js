import React from "react";
import PropTypes from "prop-types";
import Fuse from "fuse.js";
import { Link, RouteData } from "react-static";
import { maxBy, findIndex, includes, last, isEmpty } from "lodash";
import Introduction from "./components/introduction";
import Category from "./components/category";
import SidebarSearchInput from "./components/search-input";
import TableOfContents from "./components/table-of-contents";
import { kebabCase } from "lodash";

/*

<li className="Sidebar-List-Item"><a href="/open-source/victory/docs/victory-area/">VictoryArea</a></li>
<a href={`${slug}#props`}

          <ul className="Sidebar-toc">
            <li className="Sidebar-toc-item"><a href={`${slug}#${subHeadings}`}>Props</a></li>
            <li className="Sidebar-toc-item">
              <ul className="Sidebar-toc">
                <li className="Sidebar-toc-item"><a href="/open-source/victory/docs/victory-area/#animate">animate</a></li>
                <li className="Sidebar-toc-item"><a href="/open-source/victory/docs/victory-area/#categories">categories</a></li>
                <li className="Sidebar-toc-item"><a href="/open-source/victory/docs/victory-area/#containercomponent">containerComponent</a>
                </li>
              </ul>
            </li>
          </ul>

 */

// The temptation to be clever and recursive here is super strong, but this is a bit clearer
// and our subheading depth is *not* arbitrary
const SubHeadingChild = props => {
  const { slug, title } = props;
  return (
    <li className="Sidebar-toc-item">
      <Link to={`/docs/${slug}`}>{title}</Link>
    </li>
  );
};

const SubHeading = props => {
  const { slug, title, subHeadings } = props;
  return (
    <ul className="Sidebar-toc">
      <li className="Sidebar-toc-item">
        <Link to={`/docs/${slug}`}>{title}</Link>
      </li>
      <li className="Sidebar-toc-item">
        <ul className="Sidebar-toc">
          {subHeadings
            ? subHeadings.map(s => (
                <SubHeadingChild slug={s.slug} title={s.title} />
              ))
            : null}
        </ul>
      </li>
    </ul>
  );
};

// test only, filtering can happen in layer above, feels sloppy to do it here
// like filter(c => c.category === category.toLowerCase(), but is uncomfortably magical as index
const CategoryTwo = props => {
  const { category, categoryItems, active } = props;

  return (
    <>
      <p className="Sidebar-SubHeading SubHeading">{category}</p>
      {categoryItems
        ? categoryItems[2].map(c => (
            <SidebarList
              subHeadings={c.subHeadings}
              title={c.title}
              slug={c.slug}
              active={c.title === active}
            />
          ))
        : null}
    </>
  );
};

const SidebarList = props => {
  const { slug, title, active, subHeadings } = props;

  return (
    <div>
      <ul className="Sidebar-List">
        <li className="Sidebar-List-Item">
          <Link
            to={`/docs/${slug}`}
            className={active === title ? "is-active" : ""}
            aria-current="page"
          >
            {title}
          </Link>
          {active ? (
            <ul className="Sidebar-toc">
              <li className="Sidebar-toc-item">
                {subHeadings
                  ? subHeadings.map(s => (
                      <SubHeading
                        slug={s.slug}
                        title={s.title}
                        subHeadings={s.subHeadings}
                      />
                    ))
                  : null}
              </li>
            </ul>
          ) : null}
        </li>
      </ul>
    </div>
  );
};

/*
<ul className="Sidebar-List">
  <li className="Sidebar-List-Item"><a href="/open-source/victory/docs/victory-area/" className="is-active" aria-current="page">VictoryArea</a>
    <ul className="Sidebar-toc">
      <li className="Sidebar-toc-item">
        <ul className="Sidebar-toc">
          <li className="Sidebar-toc-item"><a href="/open-source/victory/docs/victory-area/#props">Props</a></li>
          <li className="Sidebar-toc-item">
            <ul className="Sidebar-toc">
              <li className="Sidebar-toc-item"><a href="/open-source/victory/docs/victory-area/#animate">animate</a></li>
              <li className="Sidebar-toc-item"><a href="/open-source/victory/docs/victory-area/#categories">categories</a></li>
              <li className="Sidebar-toc-item"><a href="/open-source/victory/docs/victory-area/#containercomponent">containerComponent</a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li className="Sidebar-List-Item"><a href="/open-source/victory/docs/victory-axis/">VictoryAxis</a></li>
  <li className="Sidebar-List-Item"><a href="/open-source/victory/docs/victory-bar/">VictoryBar</a></li>
  <li className="Sidebar-List-Item"><a href="/open-source/victory/docs/victory-boxplot/">VictoryBoxPlot</a></li>
  <li className="Sidebar-List-Item"><a href="/open-source/victory/docs/victory-candlestick/">VictoryCandlestick</a></li>
</ul>
*/

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filteredResults: props.content,
      filterTerm: ""
    };
  }

  handleInputChange(value, content) {
    const options = {
      keys: ["node.headings.value"],
      threshold: 0.2,
      findAllMatches: true,
      distance: 100
    };

    const fuse = new Fuse(content, options);
    this.setState({
      filteredResults: value ? fuse.search(value) : content,
      filterTerm: value
    });
  }

  clearInput(content) {
    this.setState({
      filteredResults: content,
      filterTerm: ""
    });
  }

  getMatchTree(link, filterTerm) {
    const options = {
      keys: ["value"],
      threshold: 0.2,
      findAllMatches: true,
      distance: 100
    };
    const fuse = new Fuse(link.headings, options);
    const matches = fuse.search(filterTerm);
    if (!isEmpty(matches)) {
      const maxDepth = maxBy(matches, "depth").depth;
      let matchIndices = matches.map(match =>
        findIndex(link.headings, heading =>
          includes(heading.value, match.value)
        )
      );
      matchIndices = matchIndices.sort((a, b) => a - b);
      return link.headings
        .slice(0, last(matchIndices) + 1)
        .reduce((memo, curr, i) => {
          const useHeading =
            i === matchIndices[0] ||
            (i < matchIndices[0] && curr.depth < maxDepth);
          if (useHeading && curr.value !== "Props") {
            memo = memo.concat(curr);
            matchIndices =
              i === matchIndices[0] ? matchIndices.slice(1) : matchIndices;
          }
          return memo;
        }, []);
    }
    return [];
  }

  //   return (
  //     <li className="Sidebar-List-Item" key={edge.slug}>
  //       <Link to={edge.slug} activeClassName="is-active">
  //         {edge.title}
  //       </Link>
  //       <TableOfContents active={active} link={link} headings={headings} />
  //     </li>
  //   );
  // });

  // const renderList = filteredEdges.map((edge) => {
  //   // const link = edge.node;
  //   // if (edge.display === false) {
  //   //   return null;
  //   // }
  //
  //   // This is the nasty way to do it, more correct would be generating
  //   // this further up
  //   // If link is currently active and not under the Introduction section,
  //   // then display its table of contents underneath it
  //   const active =
  //     category !== "introduction" &&
  //     location.pathname.includes(edge.slug)
  //       ? true
  //       : this.state.filterTerm !== "";
  //   const headings =
  //     this.state.filterTerm !== ""
  //       ? this.getMatchTree(edge, this.state.filterTerm)
  //       : edge.headings;
  //
  //   return (
  //     <li className="Sidebar-List-Item" key={edge.slug}>
  //       <Link to={edge.slug} activeClassName="is-active">
  //         {edge.title}
  //       </Link>
  //       <TableOfContents active={active} link={link} headings={headings} />
  //     </li>
  //   );
  // });

  renderLinksList(edges, type, category) {
    const { location } = this.props;

    // let filteredEdges = edges.filter((edge) => {
    //   return edge.type === type;
    // });
    //
    // if (category) {
    //   filteredEdges = filteredEdges.filter((edge) => {
    //     return edge.category === category;
    //   });
    // }

    // const active =
    //   category !== "introduction" &&
    //   location.pathname.includes(edge)
    //     ? true
    //     : this.state.filterTerm !== "";
    //

    // TODO: make this a real derived value. We can derive this more easily elsewhere, probably?

    const active = false;

    if (!edges) {
      return null;
    }

    const renderList = edges.map(edge =>
      edge.subHeadings.map((sh, i) => {
        const { value, depth } = sh;
        return (
          <li className="Sidebar-List-Item" key={value}>
            <Link to={edge.slug} activeClassName="is-active">
              {sh.value}
            </Link>
            {/* <li key={`${i}-${depth}`} className="Sidebar-toc-item"> */}
            {/* {sh.value} */}
            {/* /!*<Link to={`${link.fields.slug}#${toAnchor(item.value)}`}>*!/ */}
            {/* /!*{item.value}*!/ */}
            {/* /!*</Link>*!/ */}
            {/* </li> */}
          </li>
        );
      })
    );

    return renderList;
  }

  renderNoResults() {
    return (
      <div>
        <p className="Sidebar-Heading u-noPadding">No Results</p>
      </div>
    );
  }

  render() {
    const { content } = this.props;
    const filteredContent = this.state.filteredResults;

    return (
      <nav className="Sidebar">
        <div className="Sidebar-Grid">
          <div className="Sidebar-Search">
            <SidebarSearchInput
              onHandleInputChange={this.handleInputChange.bind(this)}
              content={content}
              searchText={this.state.filterTerm}
              onClearInput={this.clearInput.bind(this)}
            />
          </div>
          {isEmpty(filteredContent) ? this.renderNoResults() : null}

          <CategoryTwo category="Containers" categoryItems={content} />
          {/* <Introduction */}
          {/* content={this.renderLinksList( */}
          {/* filteredContent, */}
          {/* "docs", */}
          {/* "introduction" */}
          {/* )} */}
          {/* /> */}
          {/* <Category */}
          {/* title="Support" */}
          {/* content={this.renderLinksList(filteredContent, "docs", "faq")} */}
          {/* children={this.renderLinksList(filteredContent, "docs", "faq")} */}
          {/* /> */}
          {/* <Category */}
          {/* title="Guides" */}
          {/* content={this.renderLinksList(filteredContent, "guides", null)} */}
          {/* children={this.renderLinksList(filteredContent, "guides", null)} */}
          {/* /> */}
          {/* <Category */}
          {/* title="Documentation" */}
          {/* content={this.renderLinksList(filteredContent, "docs", "none")} */}
          {/* children={this.renderLinksList(filteredContent, "docs", "none")} */}
          {/* subCategories={[ */}
          {/* { */}
          {/* title: "Charts", */}
          {/* content: this.renderLinksList(filteredContent, "docs", "charts") */}
          {/* }, */}
          {/* { */}
          {/* title: "Containers", */}
          {/* content: this.renderLinksList( */}
          {/* filteredContent, */}
          {/* "docs", */}
          {/* "containers" */}
          {/* ) */}
          {/* }, */}
          {/* { */}
          {/* title: "More", */}
          {/* content: this.renderLinksList(filteredContent, "docs", "more") */}
          {/* } */}
          {/* ]} */}
          {/* /> */}
        </div>
      </nav>
    );
  }
}

Sidebar.propTypes = {
  content: PropTypes.array,
  location: PropTypes.object
};

export default Sidebar;
