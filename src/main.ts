import * as OBC from "openbim-components"
import * as THREE from "three"
import { ExampleTool } from "./bim-components"



const viewer = new OBC.Components();


const sceneComponent = new OBC.SimpleScene(viewer)
sceneComponent.setup()
viewer.scene = sceneComponent

const scene = viewer.scene.get();

const viewerContainer = document.getElementById("app") as HTMLDivElement
const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
viewer.renderer = rendererComponent
const postproduction = rendererComponent.postproduction

const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
viewer.camera = cameraComponent

const raycasterComponent = new OBC.SimpleRaycaster(viewer)
viewer.raycaster = raycasterComponent

await viewer.init()
postproduction.enabled = true

const grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x666666))
postproduction.customEffects.excludedMeshes.push(grid.get())

const ifcLoader = new OBC.FragmentIfcLoader(viewer)

 await ifcLoader.setup()

const highlighter = new OBC.FragmentHighlighter(viewer)
await highlighter.setup()

const culler = new OBC.ScreenCuller(viewer)
await culler.setup()
cameraComponent.controls.addEventListener("sleep", () => culler.needsUpdate = true)

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
highlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList()
})


const ifcFilePath = "./src/bim-components/Model.ifc";

const file =  await fetch(ifcFilePath);
const data =  await file.arrayBuffer();
const buffer = new Uint8Array(data);
const model =  await ifcLoader.load(buffer,"example");
scene.add(model);



const exampleTool = new ExampleTool(viewer)
await exampleTool.setup({
  message: "Hi there from ExampleTool!",
  requiredSetting: 123
})

const mainToolbar = new OBC.Toolbar(viewer)
mainToolbar.addChild(
  //ifcLoader.uiElement.get("main"),
  //propertiesProcessor.uiElement.get("main"),
  //exampleTool.uiElement.get("activationBtn")
)

viewer.ui.addToolbar(mainToolbar)
