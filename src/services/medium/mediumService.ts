import {
    ArrayActors,
    Data,
    Frequency,
    TotalTendenciesByActor,
} from "../../interfaces/mentions/mentionInterface";

import {
    programGroupsPeriodico,
    programGroupsRadio,
    programGroupsTv,
} from "../../constants/medium/medium";

import {
    MediumGroups,
    MediumItem,
    MediumMentions,
    MentionMedius,
    ProcessedMentionsMedium,
} from "../../interfaces/medium/mediumInterface";
import {
    CLAUDIA_SHEINBAUM_ID,
    JORGE_ALVAREZ_MAYNEZ_ID,
    XOCHITL_GALVEZ_ID,
} from "../../constants/candidates/candidates";

export async function processMentionsForMedium(
    mentions: Data[],
    medium: string
): Promise<ProcessedMentionsMedium> {
    const mediumFrequencyMap = createMediumFrequencyMap(mentions, medium);

    const mediumFrequency = getFrequencyForMedium(mediumFrequencyMap);

    const { totalPositivas, totalNeutras, totalNegativas } =
        calculateTotalTendenciesForMedium(mediumFrequency);

    return {
        mentions: mediumFrequency,
        totalPositivas,
        totalNeutras,
        totalNegativas,
        totalTendencies: totalPositivas + totalNeutras + totalNegativas,
    };
}

export function getProgramGroup(
    fnodescripcion: string,
    medium: string
): string | undefined {
    const normalizedDescription = fnodescripcion.toLowerCase().trim();
    let programGroups;

    if (medium === "Televisión") {
        programGroups = programGroupsTv;
    } else if (medium === "Periódicos") {
        programGroups = programGroupsPeriodico;
    } else if (medium === "Radio") {
        programGroups = programGroupsRadio;
    } else {
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

function createMediumFrequencyMap(
    mentions: Data[],
    medium: string
): Map<string, Frequency> {
    const frequencyMap = new Map<string, Frequency>();

    mentions.forEach((mention) => {
        const { fnodescripcion } = mention;
        const programGroup = getProgramGroup(fnodescripcion, medium);
        if (programGroup) {
            updateFrequencyMap(programGroup, mention, frequencyMap);
        }
    });

    return frequencyMap;
}

export function updateFrequencyMap(
    programGroup: string,
    mention: Data,
    topicFrequencyMap: Map<string, Frequency>
): void {
    const { vactendencia, actor } = mention;

    let mentionObj = topicFrequencyMap.get(programGroup);
    if (!mentionObj) {
        mentionObj = {
            frequency: 0,
            tendencies: { Neutra: 0, Positiva: 0, Negativa: 0 },
            actors: new Set<string>(),
        };
        topicFrequencyMap.set(programGroup, mentionObj);
    }

    mentionObj.frequency++;
    mentionObj.tendencies[vactendencia]++;
    mentionObj.actors.add(actor);
}

export function getFrequencyForMedium(
    topicFrequencyMap: Map<string, Frequency>
): MediumMentions[] {
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

export function calculateTotalTendenciesForMedium(
    topNineTopics: MediumMentions[]
): TotalTendenciesByActor {
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
function getActorName(id: string): string | undefined {
    switch (id) {
        case CLAUDIA_SHEINBAUM_ID:
            return "Claudia Sheinbaum Pardo";
        case XOCHITL_GALVEZ_ID:
            return "Xóchitl Gálvez";
        case JORGE_ALVAREZ_MAYNEZ_ID:
            return "Jorge Álvarez Máynez";
        default:
            return undefined;
    }
}
export async function processArrayOfActorsMedium(
    data: Data[],
    medium: string
): Promise<ArrayActors> {
    try {
        if (!Array.isArray(data)) {
            throw new Error("El argumento 'data' debe ser un arreglo.");
        }

        const claudiaSheinbaumMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) ===
                    "Claudia Sheinbaum Pardo" && mention.fmedescripcion === medium
        );

        const xochitlGalvezMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) === "Xóchitl Gálvez" &&
                mention.fmedescripcion === medium
        );

        const jorgeAlvarezMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) ===
                    "Jorge Álvarez Máynez" && mention.fmedescripcion === medium
        );

        return {
            claudiaSheinbaumMentions,
            xochitlGalvezMentions,
            jorgeAlvarezMentions,
        };
    } catch (error) {
        console.error("Error en processArrayOfActorsMedium:", error);
        throw error;
    }
}

export async function processArrayOfActorsMediumTrend(
    data: Data[],
    trend: string
): Promise<ArrayActors> {
    try {
        if (!Array.isArray(data)) {
            throw new Error("El argumento 'data' debe ser un arreglo.");
        }

        const claudiaSheinbaumMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) ===
                    "Claudia Sheinbaum Pardo" && mention.vactendencia === trend
        );

        const xochitlGalvezMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) === "Xóchitl Gálvez" &&
                mention.vactendencia === trend
        );

        const jorgeAlvarezMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) ===
                    "Jorge Álvarez Máynez" && mention.vactendencia === trend
        );

        return {
            claudiaSheinbaumMentions,
            xochitlGalvezMentions,
            jorgeAlvarezMentions,
        };
    } catch (error) {
        console.error("Error en processArrayOfActorsMedium:", error);
        throw error;
    }
}

export function groupMentionsByMedia(mentions: MentionMedius[]) {
    const radioGroups: string[] = [];
    const televisionGroups: string[] = [];
    const periodicosGroups: string[] = [];

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

function addToMediaGroup(group: string[], item: string) {
    if (!group.includes(item)) {
        group.push(item);
    }
}

export function processMentionsByMedia(data: MediumItem[]): MediumGroups {
    const radioGroupsSet = new Set<string>();
    const televisionGroupsSet = new Set<string>();
    const periodicosGroupsSet = new Set<string>();

    data.forEach((item) => {
        if (item.fmedescripcion === "radioGroups" && item.fnodescripcion) {
            const radioMedium = item.fnodescripcion;

            const group = Object.entries(programGroupsRadio).find(
                ([groupName, programs]) => programs.includes(radioMedium)
            );

            if (group) {
                const [groupName] = group;
                radioGroupsSet.add(groupName);
            }
        }

        if (item.fmedescripcion === "televisionGroups" && item.fnodescripcion) {
            const televisionMedium = item.fnodescripcion;

            const group = Object.entries(programGroupsTv).find(
                ([groupName, programs]) => programs.includes(televisionMedium)
            );

            if (group) {
                const [groupName] = group;
                televisionGroupsSet.add(groupName);
            }
        }

        if (item.fmedescripcion === "periodicosGroups" && item.fnodescripcion) {
            const periodicosMedium = item.fnodescripcion;

            const group = Object.entries(programGroupsPeriodico).find(
                ([groupName, programs]) => programs.includes(periodicosMedium)
            );

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

export function processItemMedium(mentions: MediumGroups): MediumItem[] {
    const mediumItems: MediumItem[] = [];

    Object.entries(mentions).forEach(([mediaType, groups]) => {
        groups.forEach((group: string) => {
            mediumItems.push({
                fmedescripcion: mediaType,
                fnodescripcion: group,
            });
        });
    });

    return mediumItems;
}
