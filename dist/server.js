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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const apollo_server_express_1 = require("apollo-server-express");
const schema_1 = require("@graphql-tools/schema");
const auth_1 = require("./auth/auth");
const merge_1 = require("@graphql-tools/merge");
const userTypeDefs_1 = __importDefault(require("./typeDefs/users/userTypeDefs"));
const mentionTypeDefs_1 = __importDefault(require("./typeDefs/mentions/mentionTypeDefs"));
const interviewTypeDefs_1 = __importDefault(require("./typeDefs/interviews/interviewTypeDefs"));
const mediumTypeDefs_1 = __importDefault(require("./typeDefs/medium/mediumTypeDefs"));
const negativeMentionTypeDefs_1 = __importDefault(require("./typeDefs/negativeMention/negativeMentionTypeDefs"));
const adminTypeDefs_1 = __importDefault(require("./typeDefs/admin/adminTypeDefs"));
const userResolver_1 = __importDefault(require("./resolvers/users/userResolver"));
const mentionResolver_1 = __importDefault(require("./resolvers/mentions/mentionResolver"));
const interviewResolver_1 = __importDefault(require("./resolvers/interviews/interviewResolver"));
const mediumResolver_1 = __importDefault(require("./resolvers/medium/mediumResolver"));
const adminResolver_1 = __importDefault(require("./resolvers/admin/adminResolver"));
const index_1 = __importDefault(require("./routes/index")); // Importar las rutas desde el archivo index.ts
const negativeMentionResolver_1 = __importDefault(require("./resolvers/negativeMention/negativeMentionResolver"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configurar cookie-parser
app.use((0, cookie_parser_1.default)());
// EJS como motor de vistas
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(body_parser_1.default.json());
app.use("/", index_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Apollo config
const typeDefs = (0, merge_1.mergeTypeDefs)([
    userTypeDefs_1.default,
    mentionTypeDefs_1.default,
    interviewTypeDefs_1.default,
    mediumTypeDefs_1.default,
    negativeMentionTypeDefs_1.default,
    adminTypeDefs_1.default,
]);
const resolvers = (0, merge_1.mergeResolvers)([
    userResolver_1.default,
    mentionResolver_1.default,
    interviewResolver_1.default,
    mediumResolver_1.default,
    negativeMentionResolver_1.default,
    adminResolver_1.default,
]);
const schema = (0, schema_1.makeExecutableSchema)({
    typeDefs,
    resolvers,
});
const server = new apollo_server_express_1.ApolloServer({
    schema,
    context: ({ req }) => {
        const token = req.headers.authorization || "";
        const isLoginQuery = req.body.query.includes("login");
        if (isLoginQuery) {
            return {};
        }
        const user = (0, auth_1.authenticate)(token);
        const adminRoutes = [
            "getNegativeMentionsForAdmin",
            "cretaOrUpdateMentionNegative",
            "deleteMentionNegative",
            "getDataForTable",
            "generateExcel",
            "createOrUpdateBalance",
            "deleteMentionNegative",
            "deleteMention",
        ];
        const isAdminRoute = adminRoutes.some((route) => req.body.query.includes(route));
        if (isAdminRoute && (!user || user.rol !== "ADMIN")) {
            throw new Error("Unauthorized access");
        }
        return { user };
    },
    introspection: true,
});
const PORT = process.env.PORT || 4010;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield server.start();
    console.log(`Servidor Express listo en http://localhost:${PORT}`);
    console.log(`Servidor GraphQL listo en http://localhost:${PORT}${server.graphqlPath}`);
    server.applyMiddleware({ app: app });
}));
