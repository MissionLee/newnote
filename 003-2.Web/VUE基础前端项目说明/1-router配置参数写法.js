// 首先是导入了开发的所有 vue组件，并且给这些组件取名字
import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import registerPro from './views/nurse/registerPro.vue'
import returnVisit from './views/nurse/returnVisit.vue'
import returnVisitInfo from './views/nurse/returnVisitInfo.vue'
// import RoutineStats from './views/statements/RoutineStats.vue'
// import DiaTreatProjct from './views/statements/DiaTreatProjct.vue'
// import RegistrationFee from './views/statements/RegistrationFee.vue'
import RoutineStats from './views/financeStatistics/RoutineStats.vue'
import DiaTreatProjct from './views/financeStatistics/DiaTreatProjct.vue'
import totalChargeRefund from './views/financeStatistics/totalChargeRefund.vue'
import drugChargeRefund from './views/financeStatistics/drugChargeRefund.vue'
import RegistrationFee from './views/financeStatistics/RegistrationFee.vue'
import clinic from './views/nurse/clinic.vue'
import clinicInfoList from './views/nurse/clinicInfoList.vue'
import chargeInfoList from './views/nurse/chargeInfoList.vue'
import Balancedetail from './views/diacrisis/Balancedetail.vue'
import Doctordetail from './views/diacrisis/Doctordetail.vue'
import Medicdetail from './views/diacrisis/Medicdetail.vue'
import Memberdetail from './views/diacrisis/Memberdetail.vue'
import assistantDiagnose from "./views/diacrisis/assistantDiagnose";
import manageHome from "./views/manageHome";
import drugWarning from "./views/inventory/drugWarning.vue";
import drugWarningDetail from "./views/inventory/drugWarningDetail.vue";
import allDiagnosis from './views/diacrisis/allDiagnosis.vue'
import SellDetails from './views/nurse/SellDetails.vue'
import hospitalization from './views/diacrisis/hospitalization.vue'
import conPatient from './views/diacrisis/conPatient.vue'
import procurementInventory from './views/inventory/procurementInventory.vue'
import emergency from './views/nurse/emergency.vue'
import isWarehousing from './views/clinicStock/IsWarehousing.vue';
import addTemplate from "./views/inventory/addTemplate";
import SupplierManage from './views/clinicStock/SupplierManage.vue';
import DrugStock from './views/supplier/DrugStock.vue';
import DrugAdjustAudit from './views/supplier/DrugAdjustAudit.vue';
import DrugInformation from "./views/inventory/DrugInformation";
import DrugInformationConfig from "./views/inventory/DrugInformationConfig";
import MedicEquipmentConfig from "./views/equipment/MedicEquipmentConfig";
import Pec from "./views/authority/Pec";
import RoleManage from "./views/authority/RoleManage.vue";
import creClinic from './views/clinicSettings/creClinic.vue';
import clinicInfo from './views/clinicSettings/clinicInfo.vue';
import DicMaintain from './views/dictionary/DicMaintain.vue';
import AuditDetails from './views/inventory/AuditDetails.vue'
import drugDestory from './views/inventory/drugDestory.vue'
import cusDetailInfo from "./views/nurse/cusDetailInfo";
import procurementReturn from "./views/inventory/procurementReturn";
import priceDetail from "./views/inventory/priceDetail";
import procurementReturnReview from "./views/clinicStock/procurementReturnReview";
import merchandise from "./views/inventory/merchandise";
import prescriptionInfo from "./views/nurse/prescriptionInfo";
import chargeMedicine from "./views/nurse/chargeMedicine";
import consumablesConsumptionAudit from "./views/clinicStock/consumablesConsumptionAudit";
import inventoryAdjustmentAudit from "./views/clinicStock/inventoryAdjustmentAudit";
import returnInformation from "./views/clinicStock/returnInformation";
import Permanag from "./views/nurse/Permanag";
import suppliesAndMedicalEquipment from "./views/equipment/suppliesAndMedicalEquipment";
import dataIllnessDictionary from "./views/equipment/dataIllnessDictionary";
import dataIllnessDatis from "./views/equipment/dataIllnessDatis";
import EquipmentDestory from "./views/equipment/EquipmentDestory";
import myCenter from "./views/personalCenter/myCenter";
import consumptionStock from "./views/inventory/consumptionStock";
import supplyAccess from "./views/inventory/supplyAccess";
import diseaseDictionary from "./views/equipment/diseaseDictionary";
import DiseaseHistory from "./views/dictionary/DiseaseHistory";
import TreatmentProject from "./views/dictionary/TreatmentProject";
import comIllness from "./views/nurse/comIllness";
import diagnosisSell from "./views/nurse/diagnosisSell";
import prescription from "./views/nurse/prescription";
import DrugLabel from './views/supplier/DrugLabel';
import BottleLabel from './views/supplier/BottleLabel';
import OutpatientMedicalRecord from './views/supplier/OutpatientMedicalRecord';


let routes = [ // 我们在这里配置的基本都是静态路由，动态路由类似于 /login/:type 详细情况参考官网
{
  path: '/login', // vue router使用必选参数 访问路径
  component: Login, // vue router 使用 必选参数 加载组件
  name: '', //我们自己定义的，用来在面包屑导航中使用 名称
  hidden: true //我们自己定义的 用来控制是否显示在侧边栏 默认false
},
{
  path: '/404',
  component: NotFound,
  name: '',
  hidden: true
},

//管理
{
  path: '/',// 路径支持父子嵌套，父子结构中的path会被拼接识别，
  component: manageHome,
  ident: 1,
  name: '主数据管理',
  iconCls: 'ios-home',
  children: [ // 对于ui组件，也可以用这样的数据画出来层级导航
    { 
      path: '/suppliesAndMedicalEquipment', 
      component: suppliesAndMedicalEquipment, 
      name: '耗材和医疗器材设置' 
    },
    { path: '/dataIllnessDictionary', component: dataIllnessDictionary, name: '病症字典' },
    { path: '/diseaseDictionary', component: diseaseDictionary, name: '疾病字典' },
    { path: '/DiseaseHistory', component: DiseaseHistory, name: '既往史' },
    { path: '/TreatmentProject', component: TreatmentProject, name: '诊疗项目字典' },
  ]
},
//病症字典子页面--子病症字典
{
  path: '/', // 
  component: manageHome,
  name: '',
  hidden: true,
  children: [
    { path: '/dataIllnessDatis', component: dataIllnessDatis, name: '病症字典  /字典子集', }
  ]
},
{
  path: '/',
  component: manageHome,
  ident: 1,
  name: '诊所设置',
  iconCls: 'ios-home',
  children: [
    { path: '/creClinic', component: creClinic, name: '创建诊所' },
    { path: '/clinicInfo', component: clinicInfo, name: '诊所信息' },
  ]
},
{
  path: '/',
  component: manageHome,
  ident: 1,
  name: '权限配置',
  iconCls: 'ios-home',
  children: [
    { path: '/Pec', component: Pec, name: '权限配置' },
    { path: '/roleManage', component: RoleManage, name: '角色管理' }
  ]
},
{
  path: '/',
  component: manageHome,
  ident: 1,
  name: '人员管理',
  iconCls: 'ios-home',
  children: [
    { path: '/Permanag', component: Permanag, name: '人员信息' },
  ]
},
{
  path: '/',
  component: manageHome,
  ident: 1,
  name: '字典维护',
  iconCls: 'ios-home',
  children: [
    { path: '/DicMaintain', component: DicMaintain, name: '字典维护' },
  ]
},

//后台  =
{
  path: '/',
  component: Home,
  name: '个人中心',
  iconCls: 'ios-home',
  children: [
    { path: '/myCenter', component: myCenter, name: '我的信息' },
    { path: '/prescription', component: prescription, name: '处方笺' },
    { path: '/DrugLabel', component: DrugLabel, name: '药签' },
    { path: '/BottleLabel', component: BottleLabel, name: '瓶签' },
    { path: '/OutpatientMedicalRecord', component: OutpatientMedicalRecord, name: '门诊病历' },
  ]
},
{
  path: '/',
  component: Home,
  name: '护士站',
  iconCls: 'ios-home',
  children: [
    //   { path: '/comIllness', component: comIllness, name: '病情主诉' },
    { path: '/registerPro', component: registerPro, name: '+挂号操作' },
    //  { path: '/todayDia', component: todayDia, name: '今日诊断' },
    //  { path: '/scheduling', component: scheduling, name: '排班计划' },
    //   { path: '/regmanage', component: regmanage, name: '挂号管理' },
    { path: '/clinic', component: clinic, name: '诊疗列表' },
    { path: '/emergency', component: emergency, name: '应急诊疗' },
    // { path: '/prescriptionDrugSale', component: prescriptionDrugSale, name: '处方拿药' },
    // { path: '/directSell', component: directSell, name: '开药售药'},
    //   { path: '/charge', component: charge, name: '药品收费'},
    //  { path: '/drugsRefund', component: drugsRefund, name: '药品退款'},
    { path: '/chargeMedicine', component: chargeMedicine, name: '拿药收费' },
    { path: '/returnVisit', component: returnVisit, name: '回访提醒' }

  ]
},
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/clinicInfoList', component: clinicInfoList, name: '诊疗详情', }
  ]
},
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/chargeInfoList', component: chargeInfoList, name: '拿药收费  /  账单列表  /  收费详情', }
  ]
},
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/prescriptionInfo', component: prescriptionInfo, name: '处方拿药详情', }
  ]
},
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/returnVisitInfo', component: returnVisitInfo, name: '诊疗回访详情', }
  ]
},
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/cusDetailInfo', component: cusDetailInfo, name: '修改患者个人信息', }
  ]
},
{
  path: '/',
  component: Home,
  name: '诊断中心',
  iconCls: 'ios-home',
  children: [
    { path: '/assistantDiagnose', component: assistantDiagnose, name: '助理诊断' },
    { path: '/allDiagnosis', component: allDiagnosis, name: '所有诊断' },
    { path: '/hospitalization', component: hospitalization, name: '住院治疗' },
    { path: '/conPatient', component: conPatient, name: '会诊患者' },
    { path: '/comIllness', component: comIllness, name: '病情主诉' }
  ]
},

{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    {
      path: '/SellDetails', component: SellDetails, name: '药品退款  /  售药详情',
    }
  ]
},
{
  path: '/',
  component: Home,
  name: '进销存',
  iconCls: 'ios-home',
  children: [
    { path: '/procurementInventory', component: procurementInventory, name: '采购入库' },
    { path: '/drugWarning', component: drugWarning, name: '药品库存查询' },
    { path: '/consumptionStock', component: consumptionStock, name: '耗材库存查询' },
    { path: '/procurementReturn', component: procurementReturn, name: '采购退货' },
    // { path: '/supplyAccess',component:supplyAccess,name:'耗材领用'},
    // { path:'/drugInventoryInquiry',component:DrugInventoryInquiry,name:'药品库存查询'},
    // { path:'/prescripMedicaQuery',component:PrescripMedicaQuery,name:'处方用药查询'},
    // { path:'/drugPriceChange',component:drugPriceChange,name:'药品价格变动'},
    { path: '/DrugStock', component: DrugStock, name: '药品库存盘点' },
    { path: '/DrugInformation', component: DrugInformation, name: '药品信息管理' },
    { path: '/DrugInformationConfig', component: DrugInformationConfig, name: '诊所药品配置' },
    { path: '/MedicEquipmentConfig', component: MedicEquipmentConfig, name: '诊所耗材配置' },
  ]
},
//入库审核明细
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/auditDetails', component: AuditDetails, name: '入库审核 / 审核明细' }
  ]
},
//药品库存明细
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/supplyAccess', component: supplyAccess, name: '耗材领用' }
  ]
},
//药品库存明细
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/drugWarningDetail', component: drugWarningDetail, name: '药品库存查询 / 明细' }
  ]
},
// //药品盘点导入修改申请审核
// {
//   path: '/',
//   component: Home,
//   name: '',
//   hidden:true,
//   children: [
//     {path: '/DrugAdjustAudit', component: DrugAdjustAudit, name: '药品库存盘点 / 药品调整审核'}
//   ]
//
// },
//采购入库子页面--新增模板
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    {
      path: '/addTemplate', component: addTemplate, name: '采购入库  /  新增模板',
    }
  ]
},
//采购退货子页面--退货
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    {
      path: '/merchandise', component: merchandise, name: '采购退货  /  退货',
    }
  ]
},
//退货复核子页面--查看退货信息
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    {
      path: '/returnInformation', component: returnInformation, name: '退货复核  /  查看',
    }
  ]
},
{
  path: '/',
  component: Home,
  name: '财务统计',
  iconCls: 'ios-home',
  children: [
    { path: '/routineStats', component: RoutineStats, name: '常规统计' },
    { path: '/totalChargeRefund', component: totalChargeRefund, name: '总收费退费明细' },
    { path: '/drugChargeRefund', component: drugChargeRefund, name: '药品收退费明细' },
    { path: '/diaTreatProjct', component: DiaTreatProjct, name: '诊疗收费明细' },
    { path: '/registrationFee', component: RegistrationFee, name: '挂号收费明细' },
    /*  { path: '/Doctordetail', component: Doctordetail, name: '医生明细'},
      { path: '/Medicdetail', component: Medicdetail, name: '诊疗师明细' },
      { path: '/Balancedetail', component: Balancedetail, name: '余额收支明细' },
      { path: '/Memberdetail', component: Memberdetail, name: '会员办理明细', },*/
  ]
},
//药品价格变动子页面/药品调价
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/priceDetail', component: priceDetail, name: '  药品价格变动  /  药品调价', }
  ]
},
//药品报损
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/drugDestory', component: drugDestory, name: '  药品库存管理  /  药品报损', }
  ]
},  //耗材报损
{
  path: '/',
  component: Home,
  name: '',
  hidden: true,
  children: [
    { path: '/EquipmentDestory', component: EquipmentDestory, name: '  耗材库存管理  /  耗材报损', }
  ]
},
{
  path: '/',
  component: Home,
  // ident:1,
  name: '诊所进销存管理',
  iconCls: 'ios-home',
  children: [
    { path: '/SupplierManage', component: SupplierManage, name: '供应商管理' },
    { path: '/isWarehousing', component: isWarehousing, name: '入库审核' },
    { path: '/procurementReturnReview', component: procurementReturnReview, name: '退货审核' },
    { path: '/consumablesConsumptionAudit', component: consumablesConsumptionAudit, name: '耗材领用审核' },
    { path: '/DrugAdjustAudit', component: DrugAdjustAudit, name: '库存调整审核' },
    // { path:'/inventoryAdjustmentAudit' ,component:inventoryAdjustmentAudit,name:'库存调整审核'}
  ]
},
{
  path: '*',
  hidden: true,
  redirect: { path: '/404' }
}
];
export default routes;
