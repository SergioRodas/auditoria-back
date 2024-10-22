"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMentionsForMedium = processMentionsForMedium;
exports.getProgramGroup = getProgramGroup;
exports.updateFrequencyMap = updateFrequencyMap;
exports.getFrequencyForMedium = getFrequencyForMedium;
exports.calculateTotalTendenciesForMedium = calculateTotalTendenciesForMedium;
exports.processArrayOfActorsMedium = processArrayOfActorsMedium;
exports.processArrayOfActorsMediumTrend = processArrayOfActorsMediumTrend;
exports.groupMentionsByMedia = groupMentionsByMedia;
exports.processMentionsByMedia = processMentionsByMedia;
exports.processItemMedium = processItemMedium;
const medium_1 = require("../../constants/medium/medium");
const candidates_1 = require("../../constants/candidates/candidates");
function processMentionsForMedium(mentions, medium) {
    return __awaiter(this, void 0, void 0, function* () {
        const mediumFrequencyMap = createMediumFrequencyMap(mentions, medium);
        const mediumFrequency = getFrequencyForMedium(mediumFrequencyMap);
        const { totalPositivas, totalNeutras, totalNegativas } = calculateTotalTendenciesForMedium(mediumFrequency);
        return {
            mentions: mediumFrequency,
            totalPositivas,
            totalNeutras,
            totalNegativas,
            totalTendencies: totalPositivas + totalNeutras + totalNegativas,
        };
    });
}
function getProgramGroup(fnodescripcion, medium) {
    const normalizedDescription = fnodescripcion.toLowerCase().trim();
    let programGroups;
    if (medium === "Televisión") {
        programGroups = medium_1.programGroupsTv;
    }
    else if (medium === "Periódicos") {
        programGroups = medium_1.programGroupsPeriodico;
    }
    else if (medium === "Radio") {
        programGroups = medium_1.programGroupsRadio;
    }
    else {
        throw new Error(`Tipo de medio no válido: ${medium}`);
    }
    for (const groupName in programGroups) {
        const programs = programGroups[groupName];
        for (const program of programs) {
            if (normalizedDescription.includes(program.toLowerCase())) {
                return groupName;
            }
        }
    }
    return undefined;
}
function createMediumFrequencyMap(mentions, medium) {
    const frequencyMap = new Map();
    mentions.forEach((mention) => {
        const { fnodescripcion } = mention;
        const programGroup = getProgramGroup(fnodescripcion, medium);
        if (programGroup) {
            updateFrequencyMap(programGroup, mention, frequencyMap);
        }
    });
    return frequencyMap;
}
function updateFrequencyMap(programGroup, mention, topicFrequencyMap) {
    const { vactendencia, actor } = mention;
    let mentionObj = topicFrequencyMap.get(programGroup);
    if (!mentionObj) {
        mentionObj = {
            frequency: 0,
            tendencies: { Neutra: 0, Positiva: 0, Negativa: 0 },
            actors: new Set(),
        };
        topicFrequencyMap.set(programGroup, mentionObj);
    }
    mentionObj.frequency++;
    mentionObj.tendencies[vactendencia]++;
    mentionObj.actors.add(actor);
}
function getFrequencyForMedium(topicFrequencyMap) {
    const frequencyArray = Array.from(topicFrequencyMap.entries())
        .filter(([medium, _]) => medium !== null)
        .map(([medium, { frequency, tendencies, actors }]) => ({
        medium,
        frequency,
        tendencies,
        actors: Array.from(actors),
    }));
    return frequencyArray;
}
function calculateTotalTendenciesForMedium(topNineTopics) {
    let totalPositivas = 0;
    let totalNeutras = 0;
    let totalNegativas = 0;
    topNineTopics.forEach(({ tendencies }) => {
        totalPositivas += tendencies.Positiva || 0;
        totalNeutras += tendencies.Neutra || 0;
        totalNegativas += tendencies.Negativa || 0;
    });
    return { totalPositivas, totalNeutras, totalNegativas };
}
function getActorName(id) {
    switch (id) {
        case candidates_1.CLAUDIA_SHEINBAUM_ID:
            return "Claudia Sheinbaum Pardo";
        case candidates_1.XOCHITL_GALVEZ_ID:
            return "Xóchitl Gálvez";
        case candidates_1.JORGE_ALVAREZ_MAYNEZ_ID:
            return "Jorge Álvarez Máynez";
        default:
            return undefined;
    }
}
function processArrayOfActorsMedium(data, medium) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!Array.isArray(data)) {
                throw new Error("El argumento 'data' debe ser un arreglo.");
            }
            const claudiaSheinbaumMentions = data.filter((mention) => getActorName(mention.vacactor.toString()) ===
                "Claudia Sheinbaum Pardo" && mention.fmedescripcion === medium);
            const xochitlGalvezMentions = data.filter((mention) => getActorName(mention.vacactor.toString()) === "Xóchitl Gálvez" &&
                mention.fmedescripcion === medium);
            const jorgeAlvarezMentions = data.filter((mention) => getActorName(mention.vacactor.toString()) ===
                "Jorge Álvarez Máynez" && mention.fmedescripcion === medium);
            return {
                claudiaSheinbaumMentions,
                xochitlGalvezMentions,
                jorgeAlvarezMentions,
            };
        }
        catch (error) {
            console.error("Error en processArrayOfActorsMedium:", error);
            throw error;
        }
    });
}
function processArrayOfActorsMediumTrend(data, trend) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!Array.isArray(data)) {
                throw new Error("El argumento 'data' debe ser un arreglo.");
            }
            const claudiaSheinbaumMentions = data.filter((mention) => getActorName(mention.vacactor.toString()) ===
                "Claudia Sheinbaum Pardo" && mention.vactendencia === trend);
            const xochitlGalvezMentions = data.filter((mention) => getActorName(mention.vacactor.toString()) === "Xóchitl Gálvez" &&
                mention.vactendencia === trend);
            const jorgeAlvarezMentions = data.filter((mention) => getActorName(mention.vacactor.toString()) ===
                "Jorge Álvarez Máynez" && mention.vactendencia === trend);
            return {
                claudiaSheinbaumMentions,
                xochitlGalvezMentions,
                jorgeAlvarezMentions,
            };
        }
        catch (error) {
            console.error("Error en processArrayOfActorsMedium:", error);
            throw error;
        }
    });
}
function groupMentionsByMedia(mentions) {
    const radioGroups = [];
    const televisionGroups = [];
    const periodicosGroups = [];
    mentions.forEach((mention) => {
        const { fmedescripcion, fnodescripcion } = mention;
        switch (fmedescripcion) {
            case "Radio":
                addToMediaGroup(radioGroups, fnodescripcion);
                break;
            case "Televisión":
                addToMediaGroup(televisionGroups, fnodescripcion);
                break;
            case "Periódicos":
                addToMediaGroup(periodicosGroups, fnodescripcion);
                break;
            default:
                break;
        }
    });
    return {
        radioGroups,
        televisionGroups,
        periodicosGroups,
    };
}
function addToMediaGroup(group, item) {
    if (!group.includes(item)) {
        group.push(item);
    }
}
function processMentionsByMedia(data) {
    const radioGroupsSet = new Set();
    const televisionGroupsSet = new Set();
    const periodicosGroupsSet = new Set();
    data.forEach((item) => {
        if (item.fmedescripcion === "radioGroups" && item.fnodescripcion) {
            const radioMedium = item.fnodescripcion;
            const group = Object.entries(medium_1.programGroupsRadio).find(([groupName, programs]) => programs.includes(radioMedium));
            if (group) {
                const [groupName] = group;
                radioGroupsSet.add(groupName);
            }
        }
        if (item.fmedescripcion === "televisionGroups" && item.fnodescripcion) {
            const televisionMedium = item.fnodescripcion;
            const group = Object.entries(medium_1.programGroupsTv).find(([groupName, programs]) => programs.includes(televisionMedium));
            if (group) {
                const [groupName] = group;
                televisionGroupsSet.add(groupName);
            }
        }
        if (item.fmedescripcion === "periodicosGroups" && item.fnodescripcion) {
            const periodicosMedium = item.fnodescripcion;
            const group = Object.entries(medium_1.programGroupsPeriodico).find(([groupName, programs]) => programs.includes(periodicosMedium));
            if (group) {
                const [groupName] = group;
                periodicosGroupsSet.add(groupName);
            }
        }
    });
    const radioGroups = Array.from(radioGroupsSet);
    const televisionGroups = Array.from(televisionGroupsSet);
    const periodicosGroups = Array.from(periodicosGroupsSet);
    return {
        radioGroups,
        televisionGroups,
        periodicosGroups,
    };
}
function processItemMedium(mentions) {
    const mediumItems = [];
    Object.entries(mentions).forEach(([mediaType, groups]) => {
        groups.forEach((group) => {
            mediumItems.push({
                fmedescripcion: mediaType,
                fnodescripcion: group,
            });
        });
    });
    return mediumItems;
}
