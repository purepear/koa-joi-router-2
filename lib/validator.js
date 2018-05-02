'use strict';

const requireAll = require('require-all');
const joi = require('joi');

const getSchemaByName = routeName => `${routeName}`;

module.exports = (schemaPath) => {
    const json_schemas = requireAll(schemaPath);
    return async function (ctx, next) {
        if (!ctx._matchedRouteName) {
            throw new Error('Router not found');
        }
        const routeName = ctx._matchedRouteName.split('_');
        const [parent, actualRoute] = routeName;
    
        const routeSchema = json_schemas[parent][getSchemaByName(actualRoute)];
    
        // 1. Validate request
        const requestSchema = routeSchema.request;
        if (requestSchema) {
            const {params} = requestSchema;
            if (params) {
                const isRequestValid = joi.validate(ctx.params, params);
                if (isRequestValid.error !== null) {
                    throw new Error(`Invalid Schema in Params of Request. ${isRequestValid.error}`);
                }
            }
            const {body} = requestSchema;
            if (body) {
                const isRequestValid = joi.validate(ctx.body, body);
                if (isRequestValid.error !== null) {
                    throw new Error(`Invalid Schema in Body of Request. ${isRequestValid.error}`);
                }
            }
            const {form} = requestSchema;
            if (form) {
                const isRequestValid = joi.validate(ctx.form.fields, form);
                if (isRequestValid.error !== null) {
                    throw new Error(`Invalid Schema in Form of Request. ${isRequestValid.error}`);
                }
            }
            const {query} = requestSchema;
            if (query) {
                const isRequestValid = joi.validate(ctx.query, query);
                if (isRequestValid.error !== null) {
                    throw new Error(`Invalid Schema in Query of Request. ${isRequestValid.error}`);
                }
            }
        }
    
    
        // 2. Request -> Response
        await next();
    
        // 3. Screen response
        const responseSchema = routeSchema.response;
        if (responseSchema) {
            const isResponseValid = joi.validate(ctx.body.data || ctx.body, responseSchema);
            if (isResponseValid.error !== null) {
                throw new Error(`Invalid Schema in Response. ${isResponseValid.error}`);
            }
        }
    }
};
