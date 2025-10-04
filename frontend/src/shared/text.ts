import rangy from 'rangy';

import "./styles/text.css";

function getSelectedNodes() {
    let selectedNodes: Node[] = [];
    var sel = rangy.getSelection();
    for (var i = 0; i < sel.rangeCount; ++i) {
        selectedNodes = selectedNodes.concat(sel.getRangeAt(i).getNodes());
    }
    return selectedNodes;
}

function makeStyled(node: Node, range: Range, isFirst: boolean, isLast: boolean, elementTag: string) {
    const isSpan = node instanceof HTMLSpanElement;


    if ((!isFirst && !isLast) || (isFirst && range.startOffset === 0)) {
        if (isSpan) {
            const element = node as HTMLSpanElement;
            element.classList.toggle(`t_${elementTag}`);
        } else {
            const newElement = document.createElement("span");
            newElement.classList.toggle(`t_${elementTag}`);
            newElement.innerText = node.nodeValue!;
            node.parentElement?.replaceChild(newElement, node);
        }
        return;
    }

    if (isFirst) {
        const contentBefore = (node.nodeValue ?? (node as HTMLSpanElement).innerText).slice(0, range.startOffset) ?? "";
        const contentAfter = (node.nodeValue ?? (node as HTMLSpanElement).innerText).slice(range.startOffset) ?? "";
        const isElement = node instanceof HTMLSpanElement;
        const initStyles = isElement ? node.className : "";

        const newElement = document.createElement("span");
        newElement.className = initStyles;
        newElement.classList.toggle(`t_${elementTag}`);
        newElement.innerText = contentAfter;
        node.parentElement!.appendChild(newElement);

        if (node.nodeValue) {
            node.nodeValue = contentBefore;
        } else {
            (node as HTMLSpanElement).innerText = contentAfter;
        }
        node.parentElement!.after()

        if (node.nextSibling) {
            node.parentElement!.insertBefore(newElement, node.nextSibling);
        } else {
            node.parentElement!.append(newElement);
        }

        console.log(node.nodeValue, contentBefore, contentAfter);
    }
}

export function changeRange(elementTag: string) {
    const nodes = getSelectedNodes();
    nodes.forEach((node, index) => {
        makeStyled(
            node, document.getSelection()?.getRangeAt(0)!,
            index === 0,
            index === nodes.length - 1,
            elementTag
        )
    })
}