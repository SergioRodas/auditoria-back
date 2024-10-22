import express, { Application } from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { authenticate } from "./auth/auth";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import loginTypeDefs from "./typeDefs/users/userTypeDefs";
import mentionTypeDefs from "./typeDefs/mentions/mentionTypeDefs";
import interviewTypeDefs from "./typeDefs/interviews/interviewTypeDefs";
import mediumTypeDefs from "./typeDefs/medium/mediumTypeDefs";
import negativeMentionTypeDefs from "./typeDefs/negativeMention/negativeMentionTypeDefs";
import adminTypeDefs from "./typeDefs/admin/adminTypeDefs";

import loginResolvers from "./resolvers/users/userResolver";
import mentionResolvers from "./resolvers/mentions/mentionResolver";
import interviewResolvers from "./resolvers/interviews/interviewResolver";
import mediumResolvers from "./resolvers/medium/mediumResolver";
import adminResolver from "./resolvers/admin/adminResolver";

import routes from "./routes/index"; // Importar las rutas desde el archivo index.ts
import negativeMentionResolver from "./resolvers/negativeMention/negativeMentionResolver";
import bodyParser from "body-parser";

dotenv.config();
const app: Application = express();

// Configurar cookie-parser
app.use(cookieParser());

// EJS como motor de vistas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use("/", routes);
app.use(express.static(path.join(__dirname, "public")));

// Apollo config
const typeDefs = mergeTypeDefs([
    loginTypeDefs,
    mentionTypeDefs,
    interviewTypeDefs,
    mediumTypeDefs,
    negativeMentionTypeDefs,
    adminTypeDefs,
]);
const resolvers = mergeResolvers([
    loginResolvers,
    mentionResolvers,
    interviewResolvers,
    mediumResolvers,
    negativeMentionResolver,
    adminResolver,
]);
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const server = new ApolloServer({
    schema,
    context: ({ req }) => {
        const token = req.headers.authorization || "";
        const isLoginQuery = req.body.query.includes("login");

        if (isLoginQuery) {
            return {};
        }

        const user = authenticate(token);

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

        const isAdminRoute = adminRoutes.some((route) =>
            req.body.query.includes(route)
        );

        if (isAdminRoute && (!user || user.rol !== "ADMIN")) {
            throw new Error("Unauthorized access");
        }
        return { user };
    },
    introspection: true,
});

const PORT = process.env.PORT || 4010;

app.listen(PORT, async () => {
    await server.start();
    console.log(`Servidor Express listo en http://localhost:${PORT}`);
    console.log(
        `Servidor GraphQL listo en http://localhost:${PORT}${server.graphqlPath}`
    );
    server.applyMiddleware({ app: app as any });
});
