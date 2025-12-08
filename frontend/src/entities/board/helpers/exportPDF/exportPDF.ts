import type { BlockType } from "../../api/block";
import styles from "./exportPDF.module.css";

export function exportPDF(blocks: BlockType[]) {
    const mainDiv = document.createElement("div");
    mainDiv.className = styles.main;
    mainDiv.style.margin = "32px";

    blocks.forEach((block: BlockType) => {
        const blockDiv = document.createElement("div");
        blockDiv.className = styles.block;
        blockDiv.innerHTML = block.value!;
        blockDiv.style.width = "400px";
        blockDiv.style.minHeight = "300px";
        blockDiv.style.paddingBottom = 45 + 16 + "px";
        blockDiv.style.paddingTop = 12 + 16 + "px";
        blockDiv.style.top = block.position.y + "px";
        blockDiv.style.left = block.position.x + "px";

        const buttonDiv = document.createElement("div");
        buttonDiv.className = styles.button;
        blockDiv.appendChild(buttonDiv);

        mainDiv.appendChild(blockDiv);
    });

    return mainDiv;
}