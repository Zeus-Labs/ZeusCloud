import { DisplayGraph} from "./AlertsTypes"
import G6, { Graph, TreeGraph } from '@antv/g6';
import { log } from "console";
import path, { relative } from "path";
import { useEffect, useRef } from "react";
import ReactDOM from 'react-dom';
import { categoryToColor, labelCategory, labelDisplay, labelImage } from "./ResourceMappings";

type RuleGraphProps={
    ruleGraph: DisplayGraph
}

export default function RuleGraph({ruleGraph}:RuleGraphProps){
    const {node_info,adjacency_list} = ruleGraph;
    // const data = {
    //     id: central_node.display_id,
    //     label: central_node.node_label,
    //     resource_id: central_node.resource_id,
    //     icon:{
    //       show: true,
    //       img: "https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg"
    //     },
    //     style:{
    //       fill:categoryToColor[resourceMap[central_node.node_label].category]
    //     }
    // };
    const canvasRef = useRef(null);

    const data = {
      nodes:new Array<{id:string,label:string,display_id:string,style:any,icon:any}>,
      edges:new Array<{source:string,target:string,style:any}>
    }
   
    


    // function addGraphNodesEdges(paths:DisplayPath[],graph:Graph){
    //   paths?.forEach(path)
    // }

    // function addTreeGraphChild(paths:DisplayPath[],graph:TreeGraph){
    //     paths?.forEach(path=>{
    //         let root = central_node.display_id;
    //         path.display_nodes.forEach(node=>{
    //             const foundNode = graph.findDataById(node.display_id);
    //             if(!foundNode){
    //                 const childData={
    //                     id: node.display_id,
    //                     label: node.node_label,
    //                     resource_id: node.resource_id,
    //                     style:{
    //                       fill:categoryToColor[resourceMap[node.node_label]?.category],
    //                     }
    //                 }
    //                 graph.addChild(childData,root);
    //             }
    //             root = node.display_id;
    //         })
    //     })
    // }

    useEffect(()=>{
      if(!node_info || !adjacency_list){
        return;
      }
      const container = ReactDOM.findDOMNode(canvasRef.current) as HTMLElement;
      const width = container?.scrollWidth || 500;
      const height = container?.scrollHeight || 300;

      Object.values(node_info)?.forEach((node)=>{
        if(!data.nodes.some(n=>n.id===node.resource_id.toString())){
          data.nodes.push({
            id: node.resource_id.toString(),
            label: labelDisplay(node.node_label),
            display_id: node.display_id,
            style:{
                  fill:categoryToColor[labelCategory(node.node_label)],
                  stroke:categoryToColor[labelCategory(node.node_label)],
                  lineWidth: 3,
                },
            icon:{
              show:true,
              img: labelImage(node.node_label),
              width: 15,
              height: 15,
            }
          });
        }
      })
  
      Object.keys(adjacency_list)?.forEach(src=>{
        adjacency_list[src].forEach(edge=>{
          const dest = edge.target_resource_id
          if(!data.edges.some(edge=>edge.source===src && edge.target===dest.toString())){
            data.edges.push({
              source:src,
              target: dest.toString(),
              style:{
                lineWidth: 1,
                stroke: `l(0) 0:${categoryToColor[labelCategory(node_info[src].node_label)]} 1:${categoryToColor[labelCategory(node_info[dest.toString()].node_label)]}`
              }
            })
          }
        })
      })

      const graph = new G6.Graph({
      container: container,
      width,
      height,
      fitView:true,
      modes: {
        default: [
          // {
          //   type: 'collapse-expand',
          //   onChange: function onChange(item:any, collapsed:any) {
          //     const data = item?.get('model');
          //     data.collapsed = collapsed;
          //     return true;
          //   },
          // },
          {
            type: 'tooltip',
            offset: 20,
            formatText: function formatText(model:any) {
              const text = model.display_id;
              return text;
            }
          },
          'drag-canvas',
          'zoom-canvas',
        ],
      },
      // plugins:[tooltip],
      
      defaultNode: {
        size: 26,
        anchorPoints: [
          [0, 0.5],
          [1, 0.5],
        ],
        labelCfg:{
            position: "bottom",
            offset: 5,
            
        }
      },
      defaultEdge: {
        type: 'polyline',
        style:{
          radius:20
        }
      },
      layout:{
        type: 'dagre',
        rankdir: 'LR',
        controlPoints: true,
        
        nodesep: 30,
        ranksep: 30
      }
      // layout: {
      //   type: 'mindmap',
      //   direction: 'H',
      //   getHeight: () => {
      //     return 30;
      //   },
      //   getWidth: () => {
      //     return 16;
      //   },
      //   getVGap: () => {
      //     return 40;
      //   },
      //   getHGap: () => {
      //     return 50;
      //   },
      //   getSide: (d:any) => {
      //       if (left_side_paths && left_side_paths.length>0 && left_side_paths.some((path)=>path.display_nodes[1]?.display_id===d.id)) {
      //         return 'left';
      //       } 
            
      //       return 'right';
      //     },
      // },
    });

    // graph.node((node)=>{
    //   return {
    //     icon:{
    //       show: true,
    //       img: "/logo192.png",
    //     }
    //   }
    // })

    graph.data(data);
    graph.render();
    // addTreeGraphChild(left_side_paths,graph);
    // addTreeGraphChild(right_side_paths,graph);

    // graph.fitView();
    // graph.refresh();
    // graph.refreshPositions();

    // graph.on('node:mouseenter', (e:any) => {
    //   graph.setItemState(e.item, 'active', true);
    //   // const tooltipDiv = container.querySelector(".g6-component-tooltip") as HTMLDivElement;
    //   // tooltipDiv.style.top ="100px!important";
    //   // tooltipDiv.style.left =`${e.item.getModel().x}px!important`;
    //   // console.log(tooltipDiv.style.top);
    // });
    // graph.on('node:mouseleave', (e:any) => {
    //   graph.setItemState(e.item, 'active', false);
    // });

    if (typeof window !== 'undefined')
      window.onresize = () => {
        if (!graph || graph.get('destroyed')) return;
        if (!container || !container.scrollWidth || !container.scrollHeight) return;
        console.log("resized");
        graph.changeSize(container.scrollWidth, container.scrollHeight);
      };
    },[])

    if(!node_info || !adjacency_list){
      return null
    }
    return(
        <div style={{position:"relative"}} ref={canvasRef}></div>
    )
}