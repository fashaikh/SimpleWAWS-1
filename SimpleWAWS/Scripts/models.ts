﻿interface IStep {
    id: number;
    title: string;
    sref: string;
    nextClass?: string;
    nextText?: string;
    onNext?: () => ng.IPromise<any>|void;
    onPrevious?: () => ng.IPromise<boolean>|void;
}

interface IAppService {
    name: string;
    sprite: string;
    title: string;
    steps: IStep[];
    templates: ITemplate[];
}

interface ITemplate {
    name: string;
    sprite: string;
    appService: string;
    language?: string;
    fileName?: string;
}

interface IAppControllerScope extends ng.IScope {
    currentAppService: IAppService;
    nextState(index: number): string;
    currentStep: any;
    nextStep: IStep;
    previousStep: IStep;
    appServices: IAppService[];
    selectAppService(appService: IAppService);
    setNextAndPreviousSteps(index: number);
    getStateLink(step: IStep);
    getLanguage(template: ITemplate): string;
    selectLanguage(language: string);
    ngModels: any;
    selectedTemplate: ITemplate;
    selectTemplate(template: ITemplate);
    changeLanguage();
}