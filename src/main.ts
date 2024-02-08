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





highlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList()
})

// const propsManager = new OBC.IfcPropertiesManager(viewer);
// propertiesProcessor.propertiesManager = propsManager;



const ifcFilePath = "./Model.ifc";
const file =  await fetch(ifcFilePath);
const data =  await file.arrayBuffer();
const buffer = new Uint8Array(data);
const model =  await ifcLoader.load(buffer,"example");
scene.add(model);

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
const propertiesUI = propertiesProcessor.uiElement

propertiesUI.get("propertiesWindow").visible = true;

propertiesProcessor.process(model);

const highlighterEvents = highlighter.events;
highlighterEvents.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList();
});

highlighterEvents.select.onHighlight.add(
(selection) => {
const fragmentID = Object.keys(selection)[0];
const expressID = Number([...selection[fragmentID]][0]);
let model
for (const group of ifcManager.groups) {
const fragmentFound = Object.values(group.keyFragments).find(id => id === fragmentID)
if (fragmentFound) model = group;
}
propertiesProcessor.renderProperties(model, expressID);
}
);

// ifcLoader.onIfcLoaded.add(async (model) => {
// propertiesProcessor.process(model);
// highlighter.events.select.onHighlight.add((Selection) =>{
//   const fragmentID = Object.keys(Selection)[0];
//   const expressID = Number([...Selection[fragmentID]][0]);
//   propertiesProcessor.renderProperties(model, expressID);
// })
// highlighter.update();
// });

// propsManager.onRequestFile.add(async () => {
// const fetched = await fetch(ifcFilePath);
// propsManager.ifcToExport = await fetched.arrayBuffer();
// })


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


const propsFinder = new OBC.IfcPropertiesFinder(viewer);
await propsFinder.init();
propsFinder.uiElement.get("queryWindow").visible = false;


propsFinder.onFound.add(result => {
highlighter.highlightByID("select", result);
})

const clipper = new OBC.EdgesClipper(viewer);
clipper.enabled = true;

const styler = new OBC.FragmentClipStyler(viewer);
await styler.setup();
await styler.update();

const mainToolbar = new OBC.Toolbar(viewer)
mainToolbar.isResizeable 

mainToolbar.addChild(
  
  exploder.uiElement.get("main"),
  modelTree.uiElement.get("main"),
  propsFinder.uiElement.get("main"),
  propertiesUI.get("main"),
  styler.uiElement.get("mainButton")
  
  
)
viewer.ui.addToolbar(mainToolbar)

const dimensionsToolbar = new OBC.Toolbar(viewer, {name: "Dimensions Toolbar", position:"right"})
dimensionsToolbar.addChild(
  angleDimensions.uiElement.get("main"),
  areaDimensions.uiElement.get("main"),
  lengthDimensions.uiElement.get("main")

)
viewer.ui.addToolbar(dimensionsToolbar)

const classifications = classifier.get();
// const classes = {};
const classNames = Object.keys(classifications.entities);

// for (const name of classNames) {
// classes[name] = true;
// }

// window.addEventListener("thatopen", async(event: any)=> {
//  const {name, payload} = event.detail;
//  if(name === "openmodel") {
//   const {name,buffer} = payload;
//   const model = await ifcLoader.load(buffer, name);
//   const scene = viewer.scene.get();
//   scene.add(model)
//  }

// })


propsFinder.enabled = true;

console.log(propsFinder)


console.log(classNames)


// console.log(ifcManager.list);



    