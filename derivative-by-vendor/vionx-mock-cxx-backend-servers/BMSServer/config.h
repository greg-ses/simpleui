//
// Created by jscarsdale on 4/15/20.
//

#include <iostream>
#include <map>
#include <string>
#include <fstream>

namespace std {
// I am not happy that I had to put these stream operators in std namespace.
// I had to because otherwise std iterators cannot find them
// - you know this annoying C++ lookup rules...
// I know one solution is to create new type inter-operable with this pair...
// Just to lazy to do this - anyone knows workaround?
    istream& operator >> (istream& is, pair<string, string>& ps)
    {
        return is >> ps.first >> ps.second;
    }
    ostream& operator << (ostream& os, const pair<const string, string>& ps)
    {
        return os << ps.first << " = " << ps.second;
    }
}

namespace config {

    //---------------------------------------------------------------------------
    // The configuration::data is a simple map string (key, value) pairs.
    // The file is stored as a simple listing of those pairs, one per line.
    // The key is separated from the value by an equal sign '='.
    // Commentary begins with the first non-space character on the line a hash or
    // semi-colon ('#' or ';').
    //
    // Example:
    //   # This is an example
    //   source.directory = C:\Documents and Settings\Jennifer\My Documents\
    //   file.types = *.jpg;*.gif;*.png;*.pix;*.tif;*.bmp
    //
    // Notice that the configuration file format does not permit values to span
    // more than one line, commentary at the end of a line, or [section]s.
    //
    struct data : std::map<std::string, std::string> {
        // Here is a little convenience method...
        bool hasKey(const std::string &s) const {
            return count(s) != 0;
        }
    };

    //---------------------------------------------------------------------------
    // The extraction operator reads configuration::data until EOF.
    // Invalid data is ignored.
    //
    std::istream &operator>>(std::istream &ins, data &d) {
        std::string s, key, value;

        // For each (key, value) pair in the file
        while (std::getline(ins, s)) {
            std::string::size_type begin = s.find_first_not_of(" \f\t\v");

            // Skip blank lines
            if (begin == std::string::npos) continue;

            // Skip commentary
            if (std::string("#;").find(s[begin]) != std::string::npos) continue;

            // Extract the key value
            std::string::size_type end = s.find('=', begin);
            key = s.substr(begin, end - begin);

            // (No leading or trailing whitespace allowed)
            key.erase(key.find_last_not_of(" \f\t\v") + 1);

            // No blank keys allowed
            if (key.empty()) continue;

            // Extract the value (no leading or trailing whitespace allowed)
            begin = s.find_first_not_of(" \f\n\r\t\v", end + 1);
            end = s.find_last_not_of(" \f\n\r\t\v") + 1;

            value = s.substr(begin, end - begin);

            // Insert the properly extracted (key, value) pair into the map
            d[key] = value;
        }

        return ins;
    }

    //---------------------------------------------------------------------------
    // The insertion operator writes all configuration::data to stream.
    //
    std::ostream &operator<<(std::ostream &outs, const data &d) {
        data::const_iterator iter;
        for (iter = d.begin(); iter != d.end(); iter++)
            outs << iter->first << " = " << iter->second << std::endl;
        return outs;
    }

    size_t readConfigFile(const char* fileName, data& configOut)
    {
        std::ifstream ifs (fileName, std::ifstream::in);
        ifs >> configOut;
        ifs.close();

        configOut["InFile"] = fileName;
        return configOut.size();
    }
}


