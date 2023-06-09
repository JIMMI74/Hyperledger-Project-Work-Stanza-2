import { deleteAnimalSchema, listAnimalsSchema } from "./schema";
import { getAnimalContractService } from "../common/ServiceFactory";
import { Animal, Owner } from "./entity";

export default function animalHandler(server, options, next) {
	
    server.get("/", { schema: listAnimalsSchema }, async (req, res) => {
		req.log.info("list animals from db");
		const animals = await server.db.animals.find();
		
		animals.transaction = await getAnimalContractService().getallanimal();
		res.send(animals);
	
    });

	server.get("/:_id", async (req, res) => {
		req.log.info("getting animal from db");
		const animal = await server.db.animals.findOne(req.params._id);
		
		animal.transaction = await getAnimalContractService().readanimal(
			animal._id
		);
		res.send(animal);
	
    });

	server.get("/:name/name", async (req, res) => {
		req.log.info("getting animals with name from db");
		const name = req.params.name;
		const animal = await server.db.animals.findOne(name);

		res
			.status(200)
			.send(await getAnimalContractService().getanimalbyname(name));
	
        });

	
        server.get("/:owner_id/owner", async (req, res) => {
		req.log.info("get animals with same owner to db");
		const owner = req.params.ownerId;
		const animal = await server.db.animals.findOne(owner);

		res
			.status(200)
			.send(await getAnimalContractService().getanimalbyowner(owner));
	
        });

	server.get("/:_id/history", async (req, res) => {
		req.log.info("transactional animal history");
		res.send(await getAnimalContractService().getanimalhistory(req.params._id));
	
    });

	server.post("/", async (req, res) => {
		req.log.info("Adding animal to db");
		let animals = (await server.db.animals.save(req.body)) as Owner;
		
		animals.transactionHash = await getAnimalContractService().createanimal(
			animals
		);
		
		res.status(201).send(animals);
	});

	server.put("/:_id", async (req, res) => {
		req.log.info("Updating animal to db");
		const _id = req.params._id;
		const animal = await server.db.animals.findOne(req.params._id);
		
		animal.transactionHash = await getAnimalContractService().updateanimal(
			animal._id,
			req.body
		);
		const animals = await server.db.animals.save({ _id, ...req.body });
		res.status(200).send(animals);
	});

	
    server.put("/:_id/name", async (req, res) => {
		req.log.info("Updating animal name to db");
		const _id = req.params._id;
		const animal = await server.db.animals.findOne(req.params._id);
		
		animal.transactionHash = await getAnimalContractService().updateanimalname(
			animal._id,
			req.body.name
		);
		animal.name = req.body.name;
		const animals = await server.db.animals.save({ _id, ...animal });
		res.status(200).send(animals);
	});

	
    server.put("/:_id/owner", async (req, res) => {
		req.log.info("Updating animal owner to db");
		const _id = req.params._id;
		const animal = await server.db.animals.findOne(req.params._id);
		
        animal.transactionHash = await getAnimalContractService().changeowner(
			animal._id,
			req.body.OwnerId,
			req.body.OwnerLastname,
			req.body.OwnerName
		);
		
        animal.OwnerId = req.body.OwnerId;
		animal.OwnerLastname = req.body.OwnerLastname;
		animal.OwnerName = req.body.OwnerName;
		const animals = await server.db.animals.save({ _id, ...animal });
		res.status(200).send(animals);
	
    });

	
    server.delete("/:_id", { schema: deleteAnimalSchema }, async (req, res) => {
		req.log.info(`delete animal ${req.params._id} from db`);
		const animal = await server.db.animals.findOne(req.params._id);
		
		animal.transaction = await getAnimalContractService().deleteanimal(
			animal._id
		);
		await server.db.animals.remove(animal);
		res.code(200).send({});
	
    });

	next();

}
