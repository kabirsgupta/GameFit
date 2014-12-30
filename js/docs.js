function updateContent(e) {
    var pageContent = document.getElementById("page-content-wrapper");

    switch (e) {
        case "overview":
            pageContent.innerHTML = "<iframe src='docs_overview.html' frameborder=\"no\" width=\"100%\" height=\"100%\" scrolling=\"no\"></iframe>";
            break;
        case "getting-started":
            pageContent.innerHTML = "<iframe src='docs_getting_started.html' frameborder=\"no\" width=\"100%\" height=\"100%\" scrolling=\"no\"></iframe>";
            break;
        case "reference":
            pageContent.innerHTML = "<iframe src='docs_reference.html' frameborder=\"no\" width=\"100%\" height=\"100%\" scrolling=\"no\"></iframe>";
            break;
        case "demo":
        pageContent.innerHTML = "<iframe src='docs_demo.html' frameborder=\"no\" width=\"100%\" height=\"100%\" scrolling=\"yes\"></iframe>";
        break;
    }
}