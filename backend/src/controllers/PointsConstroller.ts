import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
    async create (req: Request, res: Response){
        const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body
    
        const trx = await knex.transaction()

        const point = {
            image: req.file.filename,
            name, 
            email, 
            whatsapp, 
            latitude, 
            longitude, 
            city, 
            uf,
        }
    
        const insertIds = await trx('points').insert(point);
        
        const point_id = insertIds[0]
        // + = converte um número em inteiro
        const pointsItems = items
                            .split(',')
                            .map((item:string)=>+item.trim())
                            .map((items_id:number)=>{
            return {
                items_id,
                point_id
            }
        })
    
        await trx('point-items').insert(pointsItems)

        await trx.commit();
    
        return res.json({ 
            id: point_id,
            ...point,
        });
    }

    async show (req: Request, res: Response){
        const { id } = req.params
        const point = await knex('points').where('id', id).first();
        
        if(!point){
            return res.status(400).json({ message:'Point not found.' });
        }
        
        const serializedPoint =  {
            ...point,
            image_url: `http://192.168.0.9:3333/uploads/${point.image}`
        };
        
        const items = await knex('items')
                            .join('point-items','items.id', '=', 'point-items.items_id')
                            .where('point-items.point_id',id)
                            .select('items.title')


        return res.json({ point: serializedPoint, items });
    }

    async index(req: Request, res: Response){
        const { city, uf, items } =  req.query;

        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
                            .join('point-items','points.id','=', 'point-items.point_id')
                            .whereIn('point-items.items_id',parsedItems)
                            .where('city', String(city))
                            .where('uf', String(uf))
                            .distinct()
                            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...points,
                image_url: `http://192.168.0.9:3333/uploads/${point.image}`
            }
        });
        return res.json(serializedPoints)
    }
}

export default PointsController