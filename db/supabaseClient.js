// Ensure the Supabase CDN library is loaded before initializing
if (typeof window.supabase === 'undefined') {
    console.error('Supabase library is missing. Ensure the CDN script is included in index.html.');
}

// Initialize the Supabase Client globally so it can be used anywhere in the app
const supabaseDb = window.supabase.createClient(
    CONFIG.SUPABASE_URL, 
    CONFIG.SUPABASE_ANON_KEY
);

console.log("Supabase Client Initialized.");

// --- Example Helper Functions --- //

/**
 * Example function to test connection and fetch students from a Supabase 'students' table.
 */
async function fetchStudentsFromDB() {
    try {
        const { data, error } = await supabaseDb
            .from('students')
            .select('*');

        if (error) {
            console.error("Error fetching students from Supabase:", error.message);
            return null;
        }

        console.log("Successfully fetched students from Supabase:", data);
        return data;
    } catch (err) {
        console.error("Database connection failed:", err);
    }
}

/**
 * Example function to insert a new route into a Supabase 'routes' table.
 */
async function insertRouteToDB(routeData) {
    try {
        const { data, error } = await supabaseDb
            .from('routes')
            .insert([routeData]);

        if (error) {
            console.error("Error inserting route into Supabase:", error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Database connection failed:", err);
        return false;
    }
}
