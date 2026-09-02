(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const VERSION = '0.1';
    const STATUS = 'design_only_validator_no_runtime_producer';
    const INPUT_METHODS = Object.freeze(['manual','simulated_all','mixed_or_unknown']);
    const RAW_VALUES = Object.freeze([6,7,8,9]);
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const issue = (code, extra = {}) => ({ code, ...extra });

    const validateCastSnapshot = (snapshot) => {
        const issues = [];
        if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
            return { status:'invalid', issues:[issue('cast_snapshot_object_required')] };
        }
        if (snapshot.schemaVersion !== 1) issues.push(issue('cast_snapshot_schema_version_required', { value:snapshot.schemaVersion ?? null }));
        if (!Number.isInteger(snapshot.castTimestamp) || !Number.isFinite(snapshot.castTimestamp)) issues.push(issue('cast_timestamp_integer_required'));
        if (!['1','2'].includes(snapshot.daySect)) issues.push(issue('day_sect_invalid', { value:snapshot.daySect ?? null }));
        if (!Array.isArray(snapshot.rawValues) || snapshot.rawValues.length !== 6) {
            issues.push(issue('raw_values_six_required'));
        } else {
            snapshot.rawValues.forEach((value, index) => {
                if (!RAW_VALUES.includes(value)) issues.push(issue('raw_value_invalid', { index, value }));
            });
        }
        if (typeof snapshot.questionSnapshot !== 'string') issues.push(issue('question_snapshot_string_required'));
        if (!INPUT_METHODS.includes(snapshot.inputMethod)) issues.push(issue('input_method_invalid', { value:snapshot.inputMethod ?? null }));
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const validateReadingIdentity = (identity) => {
        const issues = [];
        if (!identity || typeof identity !== 'object' || Array.isArray(identity)) {
            return { status:'invalid', issues:[issue('reading_identity_object_required')] };
        }
        if (!hasText(identity.readingRef)) issues.push(issue('reading_ref_required'));
        const snapshot = validateCastSnapshot(identity.castSnapshot);
        if (snapshot.status !== 'valid') issues.push(...snapshot.issues.map((item) => ({ scope:'castSnapshot', ...item })));
        if (Object.prototype.hasOwnProperty.call(identity, 'snapshotFingerprint') && !hasText(identity.snapshotFingerprint)) {
            issues.push(issue('snapshot_fingerprint_invalid'));
        }
        return { status:issues.length ? 'invalid' : 'valid', issues };
    };

    const canonicalizeCastSnapshot = (snapshot) => {
        const validation = validateCastSnapshot(snapshot);
        if (validation.status !== 'valid') return { status:'invalid', canonical:null, issues:validation.issues };
        const canonicalObject = {
            schemaVersion:1,
            castTimestamp:snapshot.castTimestamp,
            daySect:snapshot.daySect,
            rawValues:[...snapshot.rawValues],
            questionSnapshot:snapshot.questionSnapshot,
            inputMethod:snapshot.inputMethod
        };
        return { status:'canonical', canonical:JSON.stringify(canonicalObject), canonicalObject, issues:[] };
    };

    const buildProvenanceView = (identity) => {
        const validation = validateReadingIdentity(identity);
        if (validation.status !== 'valid') {
            return { status:'unresolved', readingRef:null, castSnapshot:null, snapshotFingerprint:null, issues:validation.issues };
        }
        return {
            status:'resolved',
            readingRef:identity.readingRef,
            castSnapshot:{
                schemaVersion:identity.castSnapshot.schemaVersion,
                castTimestamp:identity.castSnapshot.castTimestamp,
                daySect:identity.castSnapshot.daySect,
                rawValues:[...identity.castSnapshot.rawValues],
                questionSnapshot:identity.castSnapshot.questionSnapshot,
                inputMethod:identity.castSnapshot.inputMethod
            },
            snapshotFingerprint:identity.snapshotFingerprint || null,
            issues:[]
        };
    };

    const describeContract = () => ({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        registered:false,
        runtimeProducerImplemented:false,
        generatesReadingRef:false,
        readingRefMustComeFromResultBoundary:true,
        castTimestampAloneAcceptedAsReadingRef:false,
        rawValuesRequired:true,
        fingerprintRequired:false,
        fingerprintEqualsReadingRef:false,
        scoringEnabled:false,
        probabilityEnabled:false
    });

    GuiJia.liuyaoReadingIdentityPretrainingV01 = Object.freeze({
        version:VERSION,
        status:STATUS,
        currentRuntimeReachable:false,
        registered:false,
        INPUT_METHODS,
        RAW_VALUES,
        validateCastSnapshot,
        validateReadingIdentity,
        canonicalizeCastSnapshot,
        buildProvenanceView,
        describeContract
    });
})(typeof window !== 'undefined' ? window : globalThis);
