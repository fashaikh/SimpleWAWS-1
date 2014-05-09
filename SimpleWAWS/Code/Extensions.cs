﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using Microsoft.WindowsAzure.Management.WebSites.Models;

namespace SimpleWAWS.Code
{
    public static class Extensions
    {
        public static string Serialize(this WebSiteGetPublishProfileResponse.PublishProfile profile)
        {
            var stringBuilder = new StringBuilder();
            stringBuilder.Append("<publishProfile ");
            var type = profile.GetType();
            foreach (var property in type.GetProperties())
            {
                if (property.Name.Equals("databases", StringComparison.InvariantCultureIgnoreCase))
                    continue;
                stringBuilder.AppendFormat("{0}=\"{1}\" ", SerializeFixups(property.Name.FirstCharToLower()), property.GetValue(profile));
            }
            stringBuilder.Append("></publishProfile>");
            return stringBuilder.ToString();
        }

        public static string SerializeFixups(string value)
        {
            switch (value.ToLowerInvariant())
            {
                case "userpassword":
                    return "userPWD";
                case "msdeploysite":
                    return "msdeploySite";
                case "sqlserverdbconnectionstring":
                    return "SQLServerDBConnectionString";
                case "destinationappuri":
                    return "destinationAppUrl";
                default:
                    return value;
            }
        }

        public static string FirstCharToLower(this string str)
        {
            return Char.ToLowerInvariant(str[0]) + str.Substring(1);
        }

        public static Stream ToStream(this string str)
        {
            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            writer.Write(str);
            writer.Flush();
            stream.Position = 0;
            return stream;
        }
    }
}