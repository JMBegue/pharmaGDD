import productAPI from "App/lib/api/product";


const handler = productAPI.handlers
export { handler as GET, handler as POST, handler as PUT, handler as PATCH , handler as DELETE }