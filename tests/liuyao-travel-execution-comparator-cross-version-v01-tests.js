'use strict';
const assert=require('assert');
require('../js/liuyao-domain-assessment-pretraining-v01.js');
require('../js/liuyao-domain-comparator-pretraining-v01.js');
require('../js/liuyao-travel-execution-comparator-pretraining-v01.js');
require('../js/liuyao-travel-execution-comparator-pretraining-v02.js');
const v1=global.GuiJia.liuyaoTravelExecutionComparatorPretrainingV01;
const v2=global.GuiJia.liuyaoTravelExecutionComparatorPretrainingV02;
let n=0;
const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name,e);process.exitCode=1;}};
const a=(id,version,status='supportive_evidence')=>({
  alternativeId:id,
  assessmentRef:`travel_execution_assessment_v${version}`,
  assessmentVersion:version,
  contractFamily:'travel_execution_assessment',
  eventType:'travel',
  duty:'travel_execution',
  dimensionId:'target_outcome',
  semanticMeaning:'journey_execution_outcome',
  resolutionStatus:'resolved',
  assessmentStatus:status,
  evidenceRefs:[`${id}-E`],
  reasonRefs:[`${id}-R`]
});

t('TCX1 v01 accepts v01 pair',()=>assert.equal(v1.compareTravelExecution(a('A','0.1'),a('B','0.1','adverse_evidence')).relation,'left_preferred_on_dimension'));
t('TCX2 v02 accepts v02 pair',()=>assert.equal(v2.compareTravelExecution(a('A','0.2'),a('B','0.2','adverse_evidence')).relation,'left_preferred_on_dimension'));
t('TCX3 v01 rejects two v02 assessments',()=>{const r=v1.compareTravelExecution(a('A','0.2'),a('B','0.2','adverse_evidence'));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.relation,null);});
t('TCX4 v02 rejects two v01 assessments',()=>{const r=v2.compareTravelExecution(a('A','0.1'),a('B','0.1','adverse_evidence'));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.relation,null);});
t('TCX5 v01 rejects mixed-version pair',()=>{const r=v1.compareTravelExecution(a('A','0.1'),a('B','0.2','adverse_evidence'));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.relation,null);});
t('TCX6 v02 rejects mixed-version pair',()=>{const r=v2.compareTravelExecution(a('A','0.2'),a('B','0.1','adverse_evidence'));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.relation,null);});
t('TCX7 same family never overrides ref mismatch',()=>{const r=v1.compareTravelExecution(a('A','0.2'),a('B','0.2'));assert(r.issues.some(i=>i.code==='assessment_ref_mismatch'));});
t('TCX8 same semantic meaning never overrides version mismatch',()=>{const r=v2.compareTravelExecution({...a('A','0.2'),assessmentVersion:'0.1'},a('B','0.2'));assert(r.issues.some(i=>i.code==='assessment_version_incompatible'));});
t('TCX9 v01 descriptor remains frozen to 0.1',()=>assert.deepEqual(v1.describeCandidate().compatibleAssessmentVersions,['0.1']));
t('TCX10 v02 descriptor remains isolated to 0.2',()=>assert.deepEqual(v2.describeCandidate().compatibleAssessmentVersions,['0.2']));
if(!process.exitCode)console.log(`Travel execution comparator cross-version regression: ${n} passed, 0 failed`);
