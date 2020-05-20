const htmlmin = require("html-minifier");

module.exports = eleventyConfig => {

  eleventyConfig.addFilter("markdownify", markdownString => {
    const MarkdownIt = require("markdown-it")
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })

    return md.render(markdownString)
  })

  // Minify our HTML
  eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  // Layout aliases
  eleventyConfig.addLayoutAlias("default", "layouts/default.njk")

  // Include our static assets
  eleventyConfig.addPassthroughCopy("site/images")
  eleventyConfig.addPassthroughCopy("site/webfonts")

  return {
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true,

    dir: {
      input: "site",
      output: "dist",
      includes: "includes",
      data: "data"
    }
  }
}