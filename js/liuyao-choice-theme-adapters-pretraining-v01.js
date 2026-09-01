(function(global){
'use strict';
const GuiJia=global.GuiJia=global.GuiJia||{};
const VERSION='0.1',STATUS='design_only_unreachable';
const issue=(code,extra={})=>({code,...extra});
const requirement=(dimensionId,providerTheme,contractRef,status='provider_required',extra={})=>({dimensionId,providerTheme,contractRef,status,...extra});
const allowed=(requested,id)=>!Array.isArray(requested)||requested.includes(id);
const filter=(items,requested)=>items.filter(x=>allowed(requested,x.dimensionId));
const baseResult=(alt,status,requirements,issues=[])=>({alternativeId:alt?.id||'',status,observationPlan:{kind:'theme_adapter_requirement_plan',semanticRole:alt?.semanticRole||'alternative',providerRequirements:requirements},dimensionEvidence:{},issues,overallRecommendation:null,scalarScore:null});

const buildCareerAdapterResult=(alt,requested=[])=>{
 const role=alt?.semanticRole||''; const req=[]; const issues=[];
 if(role==='current_employment'){
   req.push(requirement('stability','career_position','employment_retention_assessment_v0.1'));
   req.push(requirement('target_outcome','career_position','current_employment_state_assessment_v0.1','provisional_provider_required'));
   req.push(requirement('livelihood','employment_income','income_salary_assessment_current22','external_or_current22_provider_required'));
 } else if(role==='prospective_employment'){
   req.push(requirement('target_outcome','career_position','employment_transition_outcome_assessment_v0.1'));
   req.push(requirement('stability','career_position','prospective_employment_stability_assessment_v0.1','research_required'));
   req.push(requirement('livelihood','employment_income','prospective_income_fact_or_assessment','external_fact_required'));
 } else if(role==='resign_now'){
   req.push(requirement('stability','career_position','current_employment_exit_context','composite_provider_required'));
   req.push(requirement('livelihood','employment_income','post_resignation_livelihood_context','external_fact_required'));
   req.push(requirement('target_outcome','career_position','future_employment_opportunity_context','composite_provider_required'));
   issues.push(issue('resignation_action_has_no_single_traditional_selector'));
 } else return baseResult(alt,'unresolved',[],[issue('career_alternative_role_unsupported',{role})]);
 const selected=filter(req,requested);
 return baseResult(alt,selected.some(x=>x.status==='research_required'||x.status==='external_fact_required'||x.status==='composite_provider_required')?'partial':'resolved',selected,issues);
};

const buildEducationAdapterResult=(alt,requested=[])=>{
 const role=alt?.semanticRole||''; if(!['education_option','target_institution','target_program'].includes(role))return baseResult(alt,'unresolved',[],[issue('education_alternative_role_unsupported',{role})]);
 const snap=alt?.targetSnapshot||{}; const req=[]; const issues=[];
 const mode=snap.admissionMode||'unknown';
 if(mode==='exam_based') req.push(requirement('target_outcome','study_exam','exam_based_admission_assessment_v0.1'));
 else if(mode==='application_based') req.push(requirement('target_outcome','study_exam','application_based_admission_assessment_v0.1','partial_provider_required'));
 else req.push(requirement('target_outcome','study_exam','admission_mode_resolver','unresolved'));
 req.push(requirement('institution_fit','study_exam','education_institution_context_assessment_v0.1',snap.institutionResolution==='resolved'?'provider_required':'partial_provider_required'));
 req.push(requirement('stability','study_exam','bounded_academic_progress_assessment_v0.1','context_dependent_provider_required'));
 if(snap.institutionResolution!=='resolved') issues.push(issue('institution_resolution_partial_or_unresolved'));
 const selected=filter(req,requested);
 return baseResult(alt,selected.some(x=>['partial_provider_required','unresolved','context_dependent_provider_required'].includes(x.status))?'partial':'resolved',selected,issues);
};

const buildLitigationAdapterResult=(alt,requested=[])=>{
 const role=alt?.semanticRole||''; const req=[]; const issues=[];
 if(role==='accept_settlement'){
   req.push(requirement('target_outcome','litigation_dispute','settlement_terms_outcome_context','external_terms_required'));
   req.push(requirement('risk','litigation_dispute','dispute_resolution_risk_context','provider_required'));
   req.push(requirement('legal_exposure','legal_facts','legal_exposure_factual_provider','external_fact_required'));
   req.push(requirement('financial_cost','finance','settlement_value_or_cost_provider','external_or_finance_provider_required'));
   req.push(requirement('time_cost','litigation_dispute','resolution_time_context','external_fact_required'));
   req.push(requirement('resolution_feasibility','litigation_dispute','dispute_resolution_outcome_assessment_v0.1'));
 } else if(role==='continue_litigation'||role==='continue_appeal'){
   req.push(requirement('target_outcome','litigation_dispute','litigation_outcome_assessment_v0.1'));
   req.push(requirement('risk','litigation_dispute','proceeding_pressure_assessment_v0.1','provider_required'));
   req.push(requirement('legal_exposure','legal_facts','legal_exposure_factual_provider','external_fact_required'));
   req.push(requirement('financial_cost','finance','litigation_cost_fact_provider','external_fact_required'));
   req.push(requirement('time_cost','litigation_dispute','litigation_duration_fact_provider','external_fact_required'));
 } else return baseResult(alt,'unresolved',[],[issue('litigation_alternative_role_unsupported',{role})]);
 issues.push(issue('adapter_must_not_convert_yihe_into_legal_advice'));
 const selected=filter(req,requested);
 return baseResult(alt,selected.some(x=>x.status.includes('external'))?'partial':'resolved',selected,issues);
};

const buildAdapterResult=(theme,alt,requested=[])=>{
 if(theme==='career')return buildCareerAdapterResult(alt,requested);
 if(theme==='education')return buildEducationAdapterResult(alt,requested);
 if(theme==='litigation')return buildLitigationAdapterResult(alt,requested);
 return baseResult(alt,'unresolved',[],[issue('theme_adapter_unsupported',{theme})]);
};

GuiJia.liuyaoChoiceThemeAdaptersPretraining=Object.freeze({version:VERSION,status:STATUS,currentRuntimeReachable:false,inputPolicy:'structured_alternative_facts_only',buildCareerAdapterResult,buildEducationAdapterResult,buildLitigationAdapterResult,buildAdapterResult});
})(typeof window!=='undefined'?window:globalThis);
