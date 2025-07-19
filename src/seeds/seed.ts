import AppDataSource from "../config/datasource.config";

const runSeeds = async () => {
    const dataSource = await AppDataSource.initialize();
    console.log("📦 Base de datos conectada para seeding");

    try {
        console.log("🎉 Todas las semillas se ejecutaron correctamente");
    } catch (err) {
        console.error("❌ Error durante el seeding:", err);
        throw err;
    } finally {
        await dataSource.destroy();
        console.log("🔌 Conexión a la base de datos cerrada");
    }
};

runSeeds().catch((error) => {
    console.error("❌ Error fatal durante el proceso de seeding:", error);
    process.exit(1);
});
