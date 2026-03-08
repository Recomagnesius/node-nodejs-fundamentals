const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case
  const pluginName = process.argv[2];
  if(!pluginName){
    console.log("Plugin not found");
    process.exit(1);
  }
  try{
    const plugin = await import(new URL(`./plugins/${pluginName}.js`, import.meta.url));
    console.log(plugin.run());
  }catch(error){
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
