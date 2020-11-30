const username="***";
const password="****";
const clusterUri="****";
const dbName="shortner";
const table="urls";
const {MongoClient} = require('mongodb');
const { nanoid } =require( 'nanoid')
const DATABASEURI = `mongodb+srv://${username}:${password}@${clusterUri}/${dbName}?retryWrites=true&w=majority`
const client = new MongoClient(DATABASEURI,{useUnifiedTopology: true},{ useNewUrlParser: true });



async function closeConnection()
{
  await client.close();
}

async function insertDocument(client,data)
{
    const result = await client.db("shortner").collection("urls").insertOne(data);
    return  data.short_url;

}


async function searchDocument(client, table,key,value) {
  result = await client.db("shortner").collection(table)
                      .findOne({ [key]: value });

 
  return result;
}

async function updateDocument(client,table, findByKey,findByValue, value) {
  result = await client.db("shortner").collection(table)
                      .updateOne({ [findByKey]: findByValue }, { $set: value},upsert = true);

}

 async function main(args)
{
  
  responseObj = new Object()
  
 
  try {
      // Connect to the MongoDB cluster
      await client.connect();
      if(args.__ow_path)
      {
        path=(args.__ow_path.toString()).replace('/','')
        result=await  searchDocument(client,table,'short_url',path);   
        if(result!=null)
        {
          redirectUrl=result.actual_url;       
          responseObj.headers= { location:redirectUrl },
          responseObj.statusCode= 302
        }
        else
        {
          responseObj.body= {"message":"short url not found "}
        }
      }


      if(args.action=='insert')
      {
       result= await  searchDocument(client,table,'actual_url',args.actual_url);       
       if(result!=null)
       {
        responseObj.body=result;
       }
       else
       {
        short_url=await insertDocument(client,{short_url:nanoid(11),actual_url:args.actual_url})

        responseObj.body= {"message":"short url created successfully","short_url":short_url}
       }
        
      }
    
     
  } catch (e) {
    responseObj.body={"exception":e.toString()}
  
  } 
  return responseObj
  
  
}


  



module.exports = { main }

