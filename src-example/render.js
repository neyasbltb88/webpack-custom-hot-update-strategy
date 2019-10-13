export default content => {
    document.body.appendChild(document.createTextNode(content));
    document.body.appendChild(document.createElement('br'));
};
