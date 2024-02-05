import * as OBC from "openbim-components"
import * as THREE from "three"
import { ExampleTool } from "./bim-components"


// Setup the viewer
const viewer = new OBC.Components();

//Setup the Scene
const sceneComponent = new OBC.SimpleScene(viewer)
sceneComponent.setup()
viewer.scene = sceneComponent
const scene = viewer.scene.get();

const viewerContainer = document.getElementById("app") as HTMLDivElement
const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
viewer.renderer = rendererComponent
const postproduction = rendererComponent.postproduction

//Setup the Camera
const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
viewer.camera = cameraComponent

//Setup the raycaster
const raycasterComponent = new OBC.SimpleRaycaster(viewer)
viewer.raycaster = raycasterComponent
await viewer.init()
postproduction.enabled = true

//const grid = new OBC.SimpleGrid(viewer, new THREE.Color("black"))
//postproduction.customEffects.excludedMeshes.push(grid.get())

//Setup Bacground Color
const backgroundColor = new THREE.Color("white");
const materialManager = new OBC.MaterialManager(viewer);
materialManager.setBackgroundColor(backgroundColor);

//Setup ifcLoader
const ifcLoader = new OBC.FragmentIfcLoader(viewer)
await ifcLoader.setup()

const ifcManager = new OBC.FragmentManager(viewer);


//Stup Highlighter
const highlighter = new OBC.FragmentHighlighter(viewer)
await highlighter.setup()

const culler = new OBC.ScreenCuller(viewer)
await culler.setup()
cameraComponent.controls.addEventListener("sleep", () => culler.needsUpdate = true)

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
highlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList()
})


const ifcFilePath = "./Model.ifc";
const file =  await fetch(ifcFilePath);
const data =  await file.arrayBuffer();
const buffer = new Uint8Array(data);
const model =  await ifcLoader.load(buffer,"example");
scene.add(model);

ifcLoader.onIfcLoaded.add(async (model) => {
propertiesProcessor.process(model);
highlighter.events.select.onHighlight.add((Selection) =>{
  const fragmentID = Object.keys(Selection)[0];
  const expressID = Number([...Selection[fragmentID]][0]);
  propertiesProcessor.renderProperties(model, expressID);
})
highlighter.update();
});

const exampleTool = new ExampleTool(viewer)
await exampleTool.setup({
  message: "Hi there from ExampleTool!",
  requiredSetting: 123
})

//Angle Dimension Tool
const angleDimensions = new OBC.AngleMeasurement(viewer);
angleDimensions.enabled = false;
//Area Dimension Tool
const areaDimensions = new OBC.AreaMeasurement(viewer);
areaDimensions.enabled = false;
//Length Dimension Tool
const lengthDimensions = new OBC.LengthMeasurement(viewer);
lengthDimensions.enabled = false;



const classifier = new OBC.FragmentClassifier(viewer);
classifier.byStorey(model);
classifier.byEntity(model);
const exploder = new OBC.FragmentExploder(viewer);

const modelTree = new OBC.FragmentTree(viewer);
await modelTree.init();

modelTree.update(['storeys', 'entities']);


// modelTree.onSelected.add((filter) => {
//   highlighter.highlightByID('select', filter, true, true);
//   });
//   modelTree.onHovered.add((filter) => {
//   highlighter.highlightByID('hover', filter);
//   });

const mainToolbar = new OBC.Toolbar(viewer)
mainToolbar.addChild(
  
  exploder.uiElement.get("main"),
  modelTree.uiElement.get("main")
  
)
viewer.ui.addToolbar(mainToolbar)

const dimensionsToolbar = new OBC.Toolbar(viewer, {name: "Dimensions Toolbar", position:"right"})
dimensionsToolbar.addChild(
  angleDimensions.uiElement.get("main"),
  areaDimensions.uiElement.get("main"),
  lengthDimensions.uiElement.get("main")

)
viewer.ui.addToolbar(dimensionsToolbar)




window.addEventListener("thatopen", async(event: any)=> {
 const {name, payload} = event.detail;
 if(name === "openmodel") {
  const {name,buffer} = payload;
  const model = await ifcLoader.load(buffer, name);
  const scene = viewer.scene.get();
  scene.add(model)
 }

})

console.log(ifcManager.list);