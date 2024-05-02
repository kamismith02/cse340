-- 1. Insert Tony Stark into `account` table
INSERT INTO public.account (account_firstname, 
    account_lastname, 
    account_email, 
    account_password
    )
VALUES ('Tony', 
    'Stark', 
    'tony@starkent.com', 
    'Iam1ronM@n'
    );


-- 2. Modify account_type for Tony Stark
UPDATE public.account
    SET account_type = 'Admin'
    WHERE account_firstname = 'Tony' AND 
        account_lastname = 'Stark';


-- 3. Delete Tony Stark from the database
DELETE FROM public.account
    WHERE account_firstname = 'Tony' AND
        account_lastname = 'Stark';


-- 4. Modify the 'GM Hummer' record description
UPDATE public.inventory
    SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
    WHERE inv_make = 'GM' AND
        inv_model = 'Hummer';


-- 5. Use inner join to select fields from the 'classification' table and the 'inventory' table
SELECT public.inventory.inv_make, 
    public.inventory.inv_model, 
    public.classification.classification_name
    FROM public.inventory
    INNER JOIN public.classification 
        ON public.inventory.classification_id = public.classification.classification_id
        WHERE public.classification.classification_name = 'Sport';



-- 6. Update file path in inventory table to add '/vehicles'
UPDATE public.inventory
    SET inv_image = CONCAT(SUBSTRING(inv_image FROM 1 FOR POSITION('/' IN inv_image) + 1), 'vehicles/', SUBSTRING(inv_image FROM POSITION('/' IN inv_image) + 1)),
        inv_thumbnail = CONCAT(SUBSTRING(inv_thumbnail FROM 1 FOR POSITION('/' IN inv_thumbnail) + 1), 'vehicles/', SUBSTRING(inv_thumbnail FROM POSITION('/' IN inv_thumbnail) + 1)),